import * as fs from 'fs';
import { resolve } from 'path';

import { File } from "./file.js";

export const gameType = {
	TFTD: "TFTD",
	UFO: "UFO"
}
export const fileType = {
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
		this.gameType = oSettings.gameType;
		this.fileType = oSettings.fileType;
		this.palette = oSettings.palette;
		this.fileName = oSettings.fileName;
		this.images = [];
		this.imageOffsets = [];
		this.tabBytes = 2;
		if (oSettings.gameType === "TFTD" && oSettings.fileType === "UNITS"){
			this.tabBytes = 4;
		}
	}
	async loadPck(){
		let nCount = 0;
		let sPckPath = this.gameType + "/" + this.fileType + "/" + this.fileName + ".PCK";
		let fd = await this.openFile(sPckPath);
		let fileStats = await this.getFileProperties(sPckPath);
		console.log(fileStats);
		let totalBytes = fileStats.size;
		let bytesRead = 0;
		this.sprites = [];
		while (bytesRead < totalBytes){
			console.log(`Sprite ${nCount++}`);
			let { imageData, bytes } = await this.loadNextSprite(fd);

			this.logPck(imageData);
			this.sprites.push(imageData);
			bytesRead += bytes;
		}
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
	async loadNextSprite(fd){
		let totalBytes = 0;
		let imageData = [];
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
			imageData.push(0);
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
								imageData.push(0);
							}
							resolve();
						});
					} else if (buffer[0] === 0xFF){
						bDone = true;
						resolve();
					} else {
						imageData.push(buffer[0]);
						resolve();
					}
				});
			});
		}
		return { imageData: imageData, bytes: totalBytes };
	}
	logPck(aData){
		//console.log(JSON.stringify(aData));
		var nIndex = 0;
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
					console.log(`offset: ${Number(offset).toString(16)}`);
					this.imageOffsets.push(offset);
					bytesRead += bytes;
					resolve();
				})
			})
		}

	}
}
