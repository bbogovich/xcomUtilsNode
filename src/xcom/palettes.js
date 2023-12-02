import { rejects } from "assert";
import * as canvas from "canvas";

import * as fs from 'fs';
const PaletteModes = {
	UFO: "UFO",
	TFTD: "TFTD"
}
export class Palettes {

	constructor(sPath, sMode){
		this.mode = sMode;
		this.palettesDat = `${sPath}/GEODATA/PALETTES.DAT`;
		this.tftdTacticalPalettes = [
			`${sPath}/UFOGRAPH/D0.LBM`,
			`${sPath}/UFOGRAPH/D1.LBM`,
			`${sPath}/UFOGRAPH/D2.LBM`,
			`${sPath}/UFOGRAPH/D3.LBM`,
		];
		//the final 16 bytes of each palette are replaced by one of the backpals.dat palettes at runtime depending on the contexT
		//https://www.ufopaedia.org/index.php/PALETTES.DAT#BACKPALS.DAT
		this.backPalsDat = `${sPath}/GEODATA/BACKPALS.DAT`;
		this.backPals = [];
		//for tactical palette the following is used instead of a backpals entry
		this.tacticalBackpals = [
			0x8c9694,
			0x848a8c,
			0x737d84,
			0x6b757b,
			0x5a696b,
			0x525d63,
			0x4a515a,
			0x394552,
			0x313842,
			0x293039,
			0x212431,
			0x181c21,
			0x101418,
			0x080c10,
			0x000408,
			0x000000
		]
		this.geoscapePalette = [];
		this.basePalette = [];
		this.graphPalette = [];
		this.researchPalette = [];
		this.tacticalPalettes = [];
	}
	/**
	 * Reads the primary palettes for UFO or TFTD.  For UFO, all palettes are read from PALETTES.DAT.
	 * For TFTD, the tactical palettes are read from the LDM files
	 * https://www.ufopaedia.org/index.php/PALETTES.DAT
	 *
	 * @memberOf Palettes
	 */
	async loadPalettesDat(){
			//each palette consists of 768 bytes followed by 6 bytes of apparent garbage data
			const stats = await this.getFileProperties(this.palettesDat)
			let numPalettes = stats.size / 774;
			console.log(`There are ${numPalettes} palettes in the file`)
			let fd = await this.openFile(this.palettesDat)
			//zero entry is geoscape
			console.log("Read geoscape palette");
			this.geoscapePalette = await this.readPalettesDatEntry(fd);
			console.log("Read base palette");
			this.basePalette = await this.readPalettesDatEntry(fd);
			console.log("Read graph palette");
			this.graphPalette = await this.readPalettesDatEntry(fd);
			//tftd uses same palette for research and base
			if (this.mode === "UFO"){
				console.log("read research palette");
				this.researchPalette = await this.readPalettesDatEntry(fd);
			} else if (this.mode = "TFTD"){
				this.researchPalette = this.basePalette;
			}
			if (this.mode === "TFTD"){
				console.log("TFTD - use multiple tactical palettes")
				await this.loadTftdTacticalPalettes();
			} else if (this.mode === "UFO"){
				console.log("UFO - single tactical palette")
				this.tacticalPalettes[0] = await this.readPalettesDatEntry(fd);
			}
			fs.close(fd);
	}
	async loadTftdTacticalPalettes(){
		this.tacticalPalettes = [];
		for (var i = 0; i < 4; i++){
			console.log(`loading ${this.tftdTacticalPalettes[i]}`)
			let fd = await this.openFile(this.tftdTacticalPalettes[i]);
			this.tacticalPalettes.push(await this.readPalettesDatEntry(fd));
			fs.close(fd);
		}
		return Promise.resolve();
	}
	/**
	 * Reads a palette from the palettes.dat file
	 *
	 * @param {any} fd
	 * @returns
	 *
	 * @memberOf Palettes
	 */
	async readPalettesDatEntry(fd){
		let aPalette = [];
		//palette has 768 bytes of real data and 6 bytes of padding afterwards that can be ignored for a total of 774
		for (let i = 0; i < 256; i++ ){
			aPalette.push(await this.readNextColor(fd));
		}
		//throw away 6 byte padding data
		await new Promise((resolve, reject)=>{
			const discardBuffer = new Buffer.alloc(6);
			fs.read(fd, { buffer: discardBuffer, offset: 0, length: 6, position: null}, (err, bytes)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				resolve();
			})
		});
		return aPalette;
	}
	/**
	 * Read the next palette color from the provided file
	 *
	 * @param {any} fd file handle
	 * @returns Promise resolved with a 24 bit integer encoding 8 bit RGB values
	 *
	 * @memberOf Palettes
	 */
	async readNextColor(fd){
		const colorBuffer = new Buffer.alloc(3);
		return new Promise((resolve,reject)=>{
			fs.read(fd, { buffer: colorBuffer, offset: 0, length: 3, position: null}, (err, bytes)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				let nColor = Number(colorBuffer[0]) * 4;
				nColor = nColor << 8;
				nColor |= Number(colorBuffer[1]) * 4;
				nColor = nColor << 8;
				nColor |= Number(colorBuffer[2]) * 4;
				console.log(nColor.toString(16));
				resolve(nColor);
			})
		});
	}
	async loadBackpalsDat(){
		this.backPals = [];
		console.log(`load backpals from ${this.backPalsDat}`)
		let fd = await this.openFile(this.backPalsDat);
		for (var i = 0; i < 8; i ++){
			this.backPals[i] = [];
			console.log(`Backpals palette ${i}`);
			for (var j = 0; j < 16; j++){
				this.backPals[i].push(await this.readNextColor(fd));
			}
		}
		return this.backPals;
	}
	async loadPalettes(){
		await this.loadPalettesDat();
		await this.loadBackpalsDat();
	}
	async getFileProperties(sFileName){
		return new Promise((resolve, reject)=>{
			fs.stat(sFileName, (err, stats)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				resolve(stats);
			})
		});
	}
	/**
	 * @promise openFilePromise
	 *
	 * @fulfill {integer} file handle
	 * @reject {Error} error object
	 * @memberOf Palettes
	 */
	/**
	 *
	 *
	 * @returns {openFilePromise} Promise resolved when file opens
	 *
	 * @memberOf Palettes
	 */
	async openFile(sFilename){
		return new Promise((resolve, reject)=>{
			fs.open(sFilename, 'r+', function (err, fd) {
				if (err) {
					console.error(err);
					reject();
				}
				resolve(fd);
				console.log("Reading the file");
			});
		})
	}
	/**
	 * Exports a PNG file for the provided palette
	 *
	 * @param {any} aPalette
	 * @param {any} sFilename
	 *
	 * @memberOf Palettes
	 */
	async exportPNG(aPalette, sFilename){
		let nWidth = aPalette.length;
		let nHeight = 50;
		//image data is an array of four 8 bit integers per pixel in a single row r,g,b,a
		let imageArray = new Uint8ClampedArray(nWidth * nHeight * 4);
		let offset = 0;
		console.log(`${nWidth}, ${nHeight}`)
		for (let nRow = 0; nRow < nHeight; nRow++){
			for (let i = 0; i < nWidth; i++){
				let nColor = aPalette[i];
				imageArray[offset++] = (nColor >> 16) & 0xFF;
				imageArray[offset++] = (nColor >> 8) & 0xFF;
				imageArray[offset++] = (nColor & 0xFF);
				imageArray[offset++] = 255;
			}
		}
		for (let i = 0; i < imageArray.length; i++){
			//console.log(imageArray[i]);
		}
		const imageData = canvas.createImageData(imageArray, nWidth);
		const oCanvas = canvas.createCanvas(nWidth, nHeight);
		const ctx = oCanvas.getContext('2d')
		ctx.putImageData(imageData, 10, 10);
		const out = fs.createWriteStream(sFilename);
		const stream = oCanvas.createPNGStream();
		stream.pipe(out);
		return new Promise((resolve, reject)=>{
			out.on('finish', () =>  {
				console.log('The PNG file was created.');
				resolve();
			});
		});
	}
}
