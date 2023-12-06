/* global Buffer */
import * as canvas from "canvas";
import * as fs from 'fs';
import { File } from "./file.js";
/**
 * @typedef ScangItem
 * @property {ImageData} imageData ImageData object
 * @property {int} offset File offset for the image in bytes for indexing
 */
/**
 * SCANG.DAT provides tiles used by the map view as 4x4 pixel images
 *
 * https://www.ufopaedia.org/index.php/SCANG.DAT
 *
 * Tiles 1-35 are used to represent items on the map, the others are
 * the actual map tiles.
 *
 *
 * @class Scang
 * @extends {File}
 */
export class ScanG extends File {
	/**
	 * Creates an instance of scang.
	 * @param {any} sPath path to SCANG.DAT
	 * @param {palettes} palettes palettes object
	 *
	 * @memberOf scang
	 */
	constructor(sPath, palettes){
		super();
		this.filePath = sPath;
		this.palette = palettes.tacticalPalettes[0];
		this.tiles = [];
	}
	/**
	 * Loads the SCANG.DAT file
	 *
	 * @returns {ScangItem[]} array of ScanG tiles (tiles property)
	 *
	 * @memberOf ScanG
	 */
	async loadData(){
		let fd = await this.openFile(this.filePath);
		let fileStats = await this.getFileProperties(this.filePath);
		let nTotalBytes = fileStats.size;
		let nOffset = 0;
		const oBuffer = new Buffer.alloc(16);
		while (nOffset < nTotalBytes){
			let aImageArray = new Uint8ClampedArray(64);  //16 rgba pixels
			await new Promise((resolve, reject)=>{
				fs.read(fd, {buffer: oBuffer, offset: 0, length: 16, position: null}, (err)=>{
					if (err) { console.log(err); reject(); return; }
					let nBufferOffset = 0;
					for (let i = 0; i < 16; i++){
						let nByte = oBuffer[i];
						let nPaletteColour = this.palette[nByte];
						if (nPaletteColour === 0){
							aImageArray[nBufferOffset++] = 0;
							aImageArray[nBufferOffset++] = 0;
							aImageArray[nBufferOffset++] = 0;
							aImageArray[nBufferOffset++] = 0;
						} else {
							aImageArray[nBufferOffset++] = (nPaletteColour >> 16) & 0xFF;
							aImageArray[nBufferOffset++] = (nPaletteColour >> 8) & 0xFF;
							aImageArray[nBufferOffset++] = nPaletteColour & 0xFF;
							aImageArray[nBufferOffset++] = 255;
						}
					}
					this.tiles.push({
						imageData: canvas.createImageData(aImageArray, 4),
						offset: nOffset
					})
					resolve();
				})
			})
			nOffset += 16;
		}
		return this.tiles;
	}
	/**
	 * Exports a PNG file with the ScanG tiles with 16 tiles per row
	 * @param {string} sFileName file name to export to
	 * @memberOf Scang
	 */
	exportPNG(sFilename){
		let nWidth = 64;
		let nHeight = this.tiles.length / 4;
		const oCanvas = canvas.createCanvas(nWidth, nHeight);
		const ctx = oCanvas.getContext("2d");
		this.tiles.forEach((oTile, i)=>{
			ctx.putImageData(oTile.imageData, (i % 16) * 4, Math.floor(i / 16) * 4);
		})
		const out = fs.createWriteStream(sFilename);
		const stream = oCanvas.createPNGStream();
		stream.pipe(out);
		return new Promise((resolve)=>{
			out.on('finish', () =>  {
				console.log(`Export ScanG to ${sFilename} finished`);
				resolve();
			});
		});
	}
}
