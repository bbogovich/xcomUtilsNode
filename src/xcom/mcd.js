/* global Buffer */
import * as fs from 'fs';
import { File } from "./file.js";
export const FootstepSound = {
	DEFAULT: 0,
	METAL: 1,
	NORMAL: 2,
	MOUNTAIN_GROUND: 3,
	WATER_POOL: 4,
	SAND: 5,
	MARS: 6,
	SNOW: 7
}
export const TileTypes = {
	FLOOR: 0,
	WEST_WALL: 1,
	NORTH_WALL: 2,
	OBJECT: 3
}
export const ExplosiveType = {
	HIGH_EXPLOSIVE: 0,
	SMOKE: 1
}
export const SpecialProperty = {
	NONE: 0,
	ENTRY: 1,
	UFO_POWER: 2,
	UFO_NAVIGATION: 3,
	TFTD_SUB_NAVIGATION: 3,
	TFTD_BASE_DESTROY_OBJECTIVE: 3,
	TFTD_SUB_CONSTRUCTION: 4,
	UFO_CONSTRUCTION: 4,
	UFO_ALEN_FOOD: 5,
	TFTD_ALIEN_CRYOGENICS: 5,
	UFO_ALIEN_REPRODUCTION: 6,
	TFTD_ALIEN_CLONING: 6,
	UFO_ALIEN_ENTERTAINMENT: 7,
	TFTD_ALIEN_LEARNING: 7,
	UFO_ALIEN_SURGETY: 8,
	TFTD_ALIEN_IMPLANTER: 8,
	EXAMINATION_ROOM: 9,
	ALIEN_ALLOYS: 10,
	UFO_ALIEN_HABITAT: 11,
	TFTD_ALIEN_REANIMATION: 11,
	DEAD_TILE: 12,
	EXIT_POINT: 13,
	GAME_VICTORY_TARGET: 14
}
export class MCDFile extends File {
	constructor(_oSettings){
		super();
		Object.assign(this, {
			gameType: "UFO",
			filePath: "",
			tiles: [],
			name: ""
		}, _oSettings);
		if (!this.name){
			// eslint-disable-next-line no-useless-escape
			this.name = this.filePath.replace(/.+\/([^\/\\]+).MCD$/, "$1");
		}
	}

	async load(){
		if (!fs.existsSync(this.filePath)){
			this.valid = false;
			this.pckExists = false;
			console.error(`MCD file ${this.filePath} does not exist`)
			throw new Error(`MCD file ${this.filePath} does not exist`)
		}
		console.log(`Reading MCD file ${this.filePath}`)
		let fd = await this.openFile(this.filePath);
		let fileStats = await this.getFileProperties(this.filePath);
		let nTotalBytes = fileStats.size;
		let nRecords = nTotalBytes / 62;
		for (let i = 0; i < nRecords; i++){
			this.tiles.push(await this.parseNextRecord(fd));
		}
		return this.tiles;
	}

	async parseNextRecord(fd){
		const oBuffer = new Buffer.alloc(62);
		let oResult = await new Promise((resolve, reject)=>{
			fs.read(fd, {buffer: oBuffer, offset: 0, length: 62, position: null}, (err)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				let oTile = {
					animation: (()=>{
						let aAnim = [];
						for (let i = 0; i < 8; i++){
							aAnim[i] = oBuffer[i];
						}
						return aAnim;
					}),
					lineOfFireTemplate: (()=>{
						let aAnim = [];
						for (let i = 9; i < 20; i++){
							aAnim[i - 9] = oBuffer[i];
						}
						return aAnim;
					}),
					scangOffset: oBuffer[20] + (oBuffer[21] * 256) + 35,
					tab: 0,
					pck: 0,
					isSlidingDoor: oBuffer[30] === 1,
					blocksLineOfSight: oBuffer[31] === 1,
					isSolidGround: oBuffer[32] === 1,
					isWall: oBuffer[33] === 1,
					isLift: oBuffer[34] === 1,
					isHingedDoor: oBuffer[35] === 1,
					blocksFire: oBuffer[36] === 1,
					blocksGas: oBuffer[37] === 1,
					printype: 3,
					walkCost: oBuffer[39],
					slideCost: oBuffer[40],
					flyCost: oBuffer[41],
					armour: oBuffer[42],
					highExplosiveBlockage: oBuffer[43],
					deathtile: oBuffer[44],
					flammability: oBuffer[45],
					doorOpenedTile: oBuffer[46],
					didSlidingDoorOpen: oBuffer[47] === 1,
					unitYOffset: (()=>{
						//this is a signed value so first bit indicates negative
						let nValue = oBuffer[48] & 0b1111111;
						if (0b10000000 & oBuffer[48] === 0b10000000){
							nValue *= 1;
						}
						return nValue;
					}),
					tileYOffset: oBuffer[49],
					recievedDamageType: oBuffer[50],
					lightBlock: oBuffer[51],
					footstepSound: oBuffer[52],
					tileType: oBuffer[53],
					explosiveType: oBuffer[54],
					explosiveStrength: oBuffer[55],
					gasblock: oBuffer[56],
					fuel: oBuffer[57],
					brightness: oBuffer[58],
					specialProps: oBuffer[59],
					baseTarget: oBuffer[60],
					victoryPoints: oBuffer[61]
				};
				resolve(oTile);
			});
		})
		return oResult;
	}
	exportJSON(sExportFileName){
		let oExportObject = {
			name: this.name,
			index: this.tabIndex
		};
		try {
			fs.writeFileSync(sExportFileName, JSON.stringify(oExportObject));
		} catch (err) {
			console.error(err);
		}
	}
}
