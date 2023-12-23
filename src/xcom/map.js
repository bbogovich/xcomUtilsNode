/* global Buffer */
import * as canvas from "canvas";
import * as fs from 'fs';
import { MCDFile } from "./mcd.js";
import { PckFile } from "../pck.js";
import { File } from "./file.js";

/**
 * @typedef MapTile
 * @property {number} index in collated MCD array of north wall
 * @property {number} west index in collated MCD array of west wall
 * @property {number} ground index in collated MCD array of ground
 * @property {number} object index in collated MCD array of object in tile
 * @memberof Map
 */
/**
 * Represents a MAP file
 *
 * https://www.ufopaedia.org/index.php/MAPS
 *
 * @export
 * @class Map
 */
export class Map extends File {
	/**
	 * @type {string} path to .MAP file
	 * @memberOf Map
	 */
	mapPath;
	/**
	 * @type {string[]} terrainPaths  array of directories containing terrain files
	 * @memberOf Map
	 */
	terrainPaths;
	/**
	 * @type {string[]} terrains  array of terrain file base names
	 * @memberOf Map
	 */
	terrains;
	/**
	 * @type {number} width map width (x-index) in tiles
	 * @memberOf Map
	 */
	width;
	/**
	 * @type {int} number of vertical levels in the map
	 * @memberOf Map
	 */
	height;
	/**
	 * @type {int} depth map depth (y-index) in tiles
	 * @memberOf Map
	 */
	depth;
	/**
	 * @type {MapTile[][][]} array of tiles in the map
	 * @memberOf Map
	 */
	mcdArray;
	/**
	 * @type
	 * @memberOf Map
	 */
	palette;
	constructor(_oSettings){
		super();
		Object.assign(this, {
			mapPath: "",  //path to .MAP file
			terrainPaths: [],  //array of directories containing terrains (allow multiple to allow for openxcom mods)
			terrains: [], //array of terrain names.  Each must have a PCK, TAB, MCD in the same directory
			width: 0,
			depth: 0,
			height: 0,
			mcdArray: [],  //combined MCD array (all terrains concatenated to get MCD indices in the map data)
			palette: []    //tactical palette
		}, _oSettings);
		//sGame, sGamePath, nTacticalPaletteIndex, sTerrain
	}
	/**
	 * Finds the paths to terrain pck/tab/mcd files
	 *
	 * @param {any} sTerrainName terrain name
	 * @returns {object} object with file paths
	 *
	 * @memberOf Map
	 */
	findTerrainPaths(sTerrainName){
		for (let i = 0; i < this.terrainPaths.length; i++){
			if (fs.existsSync(`${this.terrainPaths[i]}/${sTerrainName}.PCK`) &&
					fs.existsSync(`${this.terrainPaths[i]}/${sTerrainName}.TAB`) &&
					fs.existsSync(`${this.terrainPaths[i]}/${sTerrainName}.MCD`)){
				return {
					pckPath: `${this.terrainPaths[i]}/${sTerrainName}.PCK`,
					tabPath: `${this.terrainPaths[i]}/${sTerrainName}.TAB`,
					mcdPath: `${this.terrainPaths[i]}/${sTerrainName}.MCD`
				}
			}
		}
	}
	/**
	 * Loads all terrain resources and generate the combined MCD array
	 *
	 * @memberOf Map
	 */
	async loadTerrains(){
		this.mcdArray = [];
		this.terrains.forEach(async (sTerrainName)=>{
			let oTerrain = await this.loadTerrain(sTerrainName);
			oTerrain.mcd.tiles.forEach((oTile)=>{
				this.mcdArray.push(oTile);
			});
		});
	}
	/**
	 * Loads resource files for a single terrain
	 *
	 * @param {any} sTerrainName
	 * @returns {object} object with terrain pck, mcd, tab
	 *
	 * @memberOf Map
	 */
	async loadTerrain(sTerrainName){
		let oTerrain = this.findTerrainPaths(sTerrainName);
		this.terrains.push(Object.assign({}))
		await this._pPalettes;
		oTerrain.pck = new PckFile({
			fileType: "TERRAIN",
			palettes: this.palettes,
			pckPath: oTerrain.pckPath,
			tabPath: oTerrain.tabPath
		});
		oTerrain.mcd = new MCDFile({
			filePath: oTerrain.mcdPath
		});
		await Promise.all([oTerrain.pck, oTerrain.mcd]);
		oTerrain.mcd.tiles.forEach((oTile)=>{
			oTile.pck = oTerrain.pck,
			oTile.tab = oTerrain.pck.tabIndex
		})
		return oTerrain;
	}
	/**
	 * Loads the map file into a three dimensional array
	 *
	 * @returns
	 *
	 * @memberOf Map
	 */
	async loadMap(){
		if (!fs.existsSync(this.mapPath)){
			console.log(`Map file ${this.mapPath} not found`);
			this.mapExists = false;
			return;
		}
		console.log(`Reading map file ${this.mapExists}`);
		let fd = await this.openFile(this.mapPath);
		let fileStats = await this.getFileProperties(this.mapPath);
		let totalBytes = fileStats.size;
		const oHeaderBuffer = new Buffer.alloc(3);
		await new Promise((resolve, reject)=>{
			fs.read(fd, {buffer: oHeaderBuffer, offset: 0, length: 3}, (oErr, bytes)=>{
				if (oErr){
					console.log(oErr);
					reject(oErr);
					return;
				}
				this.height = oHeaderBuffer[0];
				this.width = oHeaderBuffer[1];
				this.depth = oHeaderBuffer[2];
				resolve();
			});
		});
		const oTileBuffer = new Buffer.alloc(4);
		let bytesRead = 3;
		let nRow = 0, nCol = 0;
		let oLevel = [];
		let oRow = [];
		this.map.push(oLevel);
		while (bytesRead < totalBytes){
			await new Promise((resolve, reject)=>{
				fs.read(fd, {buffer: oTileBuffer, offset: 0, length: 4}, (oErr, bytes)=>{
					if (oErr) {
						console.error(oErr); reject();
					} else {
						bytesRead += bytes;
						oRow.push({
							floor: oTileBuffer[0],
							west: oTileBuffer[1],
							north: oTileBuffer[2],
							object: oTileBuffer[3]
						});
						if (++nCol === this.width){  //full row is completed
							//advance to next row
							oRow = [];
							nCol = 0;
							if (++nRow === this.depth){  //all rows for this height are filled
								nRow = 0;
								oLevel = [];
								this.map.push(oLevel);
							}
							oLevel.push(oRow);
						}
						resolve();
					}
				});
			});
		}
		return this.map;
	}
	/**
	 * Exports the map to a JSON file
	 *
	 * @param {any} sExportFileName
	 * @returns {Promise} resolved with the generated JSON string
	 *
	 * @memberOf Map
	 */
	async exportMapJSON(sExportFileName){
		var oExportObject = {
			terrains: this.terrains,
			mapTiles: this.map
		}
		return new Promise((resolve, reject)=>{
			let sJSON = JSON.stringify(oExportObject);
			fs.writeFile(sExportFileName, sJSON, err => {
				if (err) {
					console.error(err);
					reject();
				} else {
					resolve(sJSON);
				}
			});
		})
	}
	/**
	 * Exports a rendering of the map at the specified level to a PNG file
	 *
	 * @param {string} sExportFileName file name
	 * @param {number} nLevel height / z index (0 is top)
	 *
	 * @memberOf Map
	 */
	exportMapPNG(sExportFileName, nLevel){

	}
}
