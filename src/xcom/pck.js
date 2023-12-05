import { rejects } from "assert";
import * as canvas from "canvas";

import * as fs from 'fs';
import { resolve } from 'path';

import { File } from "./file.js";

export const gameType = {
	TFTD: "TFTD",
	UFO: "UFO"
}
export const pckFileType = {
	TERRAIN: "TERRAIN",
	UFOGRAPH: "UFOGRAPH",
	UNITS: "UNITS"
}
export class PckFile extends File {
	constructor(_oSettings){
		super()
		let oSettings = Object.assign({
			gameType: "UFO",
			fileType: "TERRAIN",
			palette: [],
			fileName: ""
		}, _oSettings);
		this.sprites = [];
		this.gameType = oSettings.gameType;
		this.fileType = oSettings.fileType;
		this.palette = oSettings.palette;
		this.fileName = oSettings.fileName;
		this.images = [];
		this.imageOffsets = [];
		this.tabBytes = 2;
		this.spriteSheetRows = 0;
		this.spriteSheetCols = 16;
		if (oSettings.gameType === "TFTD" && oSettings.fileType === "UNITS"){
			this.tabBytes = 4;
		}
	}
	/**
	 * @typedef sprite
	 * @proeprty {int} index - index of the sprite in the PCK file
	 * @property {byte[]} rawData array of image data as bytes representing palette entries
	 * @property {ImageData} imageData Canvas image data object
	 *
	 * @returns
	 *
	 * @memberOf PckFile
	 */
	/**
	 * Loads the PCK file and unpacks its contents into sprite data
	 *
	 * @returns
	 *
	 * @memberOf PckFile
	 */
	async loadPck(){
		let nCount = 0;
		let sPckPath = this.gameType + "/" + this.fileType + "/" + this.fileName + ".PCK";
		let fd = await this.openFile(sPckPath);
		let fileStats = await this.getFileProperties(sPckPath);
		console.log(fileStats);
		let nTotalBytes = fileStats.size;
		let nOffset = 0;
		let nIndex = 0;
		let nSpriteSheetRow = 0, nSpriteSheetCol = 0;
		this.sprites = [];
		while (nOffset < nTotalBytes){
			let { rawData, imageData, bytes } = await this.readNextSprite(fd);
			//this.logPck(rawData);
			this.sprites.push({
				index: nIndex++,
				rawData: rawData,
				imageData: imageData,
				offset: nOffset,
				spriteSheetRow: nSpriteSheetRow,
				spriteSheetCol: nSpriteSheetCol
			});
			nSpriteSheetCol += 1;
			if (nSpriteSheetCol > this.spriteSheetCols){
				nSpriteSheetRow++;
				nSpriteSheetCol = 0;
			}
			nOffset += bytes;
		}
		this.spriteSheetRows = nSpriteSheetRow + 1;
		this.spriteSheetCols = nSpriteSheetCol + 1;
		return this.sprites;
	}
	/**
	 * Promise loadSpritePromise
	 *
	 * @fulfill {byte[]} array of pixel data as pallete entries
	 * @reject {Error} error object
	 * @memberOf PckFile
	 */
	/**
	 * Read the next sprite from the open pck file as decompressed palette indexes
	 * https://www.ufopaedia.org/index.php/Image_Formats#PCK
	 * @param {any} fd
	 *
	 * @memberOf PckFile
	 */
	async readNextSprite(fd){
		let totalBytes = 0;
		let rawData = [];
		//sprites are 32x40
		//each byte in the file represents an index in the corresponding pallete
		//buffer is width*height bytes; actual size is always smaller but guarantees enough room
		const buffer = new Buffer.alloc(1);
		//first byte is number of empty rows; palette entry 0 is always transparency
		//0xFE indicates next byte is the number of transparent pixels
		//0xFF is end of data for this sprite
		//anything else is an index in the pallete
		let bDone = false;
		let nSkipRows = await new Promise((resolve, reject)=>{
			fs.read(fd, { buffer: buffer, offset: 0, length: 1, position: null}, (err, bytes)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				resolve(buffer[0]);
				totalBytes += bytes;
			});
		});
		for (let i = 0; i < nSkipRows * 32; i++){
			rawData.push(0);
		}
		while (!bDone){
			await new Promise((resolve, reject)=>{
				//read next byte
				fs.read(fd, { buffer: buffer, offset: 0, length: 1, position: null}, (err, bytes)=>{
					totalBytes += bytes;
					if (buffer[0] === 0xFE){  //start of a transparent run, read next byte for count
						fs.read(fd, { buffer: buffer, offset: 0, length: 1, position: null }, (err2, bytes2)=>{
							totalBytes += bytes2;
							for (let i = 0; i < buffer[0]; i++){
								rawData.push(0);
							}
							resolve();
						});
					} else if (buffer[0] === 0xFF){
						bDone = true;
						resolve();
					} else {
						rawData.push(buffer[0]);
						resolve();
					}
				});
			});
		}
		let imageArray =  new Uint8ClampedArray(32 * 40 *4);
		for (let i = 0, nOffset = 0; i < rawData.length; i++){
			let nRawPixel = rawData[i];
			let r = 0, g = 0, b = 0, a = 0;
			let nColor = this.palette[nRawPixel];
			if (nRawPixel > 0){
				imageArray[nOffset++] = (nColor >> 16) & 0xFF;
				imageArray[nOffset++] = (nColor >> 8) & 0xFF;
				imageArray[nOffset++] = nColor & 0xFF;
				imageArray[nOffset++] = 255;
			} else {
				imageArray[nOffset++] = 0;
				imageArray[nOffset++] = 0;
				imageArray[nOffset++] = 0;
				imageArray[nOffset++] = 0;
			}
		}
		let imageData = canvas.createImageData(imageArray, 32);
		return { imageData: imageData, rawData: rawData, bytes: totalBytes };
	}
	/**
	 * Exports a single sprite from the PCK file to a PNG
	 *
	 * @param {any} sFileName name of export file
	 * @param {any} nIndex Index of the sprite to export
	 * @returns
	 *
	 * @memberOf PckFile
	 */
	async exportSprite(sFileName, nIndex){
		console.log(`Export sprite ${nIndex} to ${sFileName}`);
		const oCanvas = canvas.createCanvas(32, 40);
		const ctx = oCanvas.getContext("2d");
		ctx.putImageData(this.sprites[nIndex].imageData, 0, 0);
		const out = fs.createWriteStream(sFileName);
		const stream = oCanvas.createPNGStream();
		stream.pipe(out);
		return new Promise((resolve, reject)=>{
			out.on("finish", ()=>{
				console.log(`PNG file ${sFileName} created`)
				resolve();
			})
		})
	}
	/**
	 * Exports a sprite sheet PNG for the current PCK file
	 *
	 * @param {any} sFilename name of exported file
	 * @returns {Promise} promise resolved on finish
	 *
	 * @memberOf PckFile
	 */
	async exportSpriteSheet(sFilename){
		console.log(`Export spritesheet to ${sFilename}`);
		let nWidth = this.spriteSheetRows * 40,
			nHeight = this.spriteSheetCols * 32;
		const oCanvas = canvas.createCanvas(nWidth, nHeight);
		const ctx = oCanvas.getContext('2d')
		this.sprites.forEach((oSprite)=>{
			ctx.putImageData(oSprite.imageData, oSprite.spriteSheetCol * 32, oSprite.spriteSheetRow * 40);
		});
		const out = fs.createWriteStream(sFilename);
		const stream = oCanvas.createPNGStream();
		stream.pipe(out);
		return new Promise((resolve, reject)=>{
			out.on('finish', () =>  {
				console.log(`Export spritesheet to ${sFilename} finished`);
				resolve();
			});
		});
	}
	logPck(oSprite){
		//console.log(JSON.stringify(aData));
		console.log(`Sprite ${oSprite.index} Offset ${oSprite.offset.toString(16)}`);
		var nIndex = 0;
		let aData = oSprite.rawData;
		for (let nRow = 0; nRow < 40; nRow++){
			let sRow = "";

			for (let nCol = 0; nCol < 32; nCol++){
				if (nIndex < aData.length){
					if (aData[nIndex] === 0){
						sRow += "  "
					} else {
						let sByte = Number(aData[nIndex]).toString(16);
						if (sByte.length == 1){
							sByte = `0${sByte}`;
						}
						sRow += sByte;
					}
				} else {
					sRow += "  ";
				}
				nIndex++;
				sRow += " ";
			}
			console.log(sRow);
		}
		console.log("");
	}
	async loadTab(){
		let sTabPath = this.gameType + "/" + this.fileType + "/" + this.fileName + ".TAB";
		console.log(`reading tab file ${sTabPath}`)
		let fd = await this.openFile(sTabPath);
		let fileStats = await this.getFileProperties(sTabPath);
		console.log(fileStats);
		let totalBytes = fileStats.size;
		let bytesRead = 0;
		const offsetBuffer = new Buffer.alloc(this.tabBytes);
		while (bytesRead < totalBytes){
			await new Promise((resolve, reject)=>{
				fs.read(fd, {buffer: offsetBuffer, offset: 0, length: this.tabBytes, position: null}, (err, bytes)=>{
					if (err){
						console.log(err);
						reject(err);
						return;
					}
					let offset = (offsetBuffer[0] << 8) | offsetBuffer[1];
					//console.log(`offset: ${Number(offset).toString(16)}`);
					this.imageOffsets.push(offset);
					bytesRead += bytes;
					resolve();
				})
			})
		}
	}
	async load(){
		await this.loadTab();
		await this.loadPck();
	}
}
