/* global process */
import { Palettes } from "../src/xcom/palettes.js";
import { PckFile } from "../src/xcom/pck.js";
import { ScanG } from "../src/xcom/scang.js";
import * as fs from 'fs';

if (!fs.existsSync(`${process.cwd()}/exports`)){
	fs.mkdirSync(`${process.cwd()}/exports`);
}

if (!fs.existsSync(`${process.cwd()}/exports/ufo`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo`);
}

if (!fs.existsSync(`${process.cwd()}/exports/ufo/palettes`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/palettes`);
}

if (!fs.existsSync(`${process.cwd()}/exports/ufo/units`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/units`);
}
if (!fs.existsSync(`${process.cwd()}/exports/ufo/ufograph`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/ufograph`);
}
if (!fs.existsSync(`${process.cwd()}/exports/ufo/geodata`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/geodata`);
}
if (!fs.existsSync(`${process.cwd()}/exports/ufo/geograph`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/geograph`);
}

if (!fs.existsSync(`${process.cwd()}/exports/ufo/terrain`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/terrain`);
}

const ufoPalettes = new Palettes("UFO", "UFO");
await ufoPalettes.loadPalettesDat();
await ufoPalettes.loadBackpalsDat();
await ufoPalettes.exportPNG(ufoPalettes.geoscapePalette, `${process.cwd()}/exports/ufo/palettes/geoscape.png`);
await ufoPalettes.exportPNG(ufoPalettes.graphPalette, `${process.cwd()}/exports/ufo/palettes/graph.png`);
await ufoPalettes.exportPNG(ufoPalettes.basePalette, `${process.cwd()}/exports/ufo/palettes/base.png`);
await ufoPalettes.exportPNG(ufoPalettes.researchPalette, `${process.cwd()}/exports/ufo/palettes/research.png`);
await ufoPalettes.exportPNG(ufoPalettes.tacticalPalettes[0], `${process.cwd()}/exports/ufo/palettes/tactical.png`);
await ufoPalettes.exportPNG(ufoPalettes.backPals, `${process.cwd()}/exports/ufo/palettes/backpals.png`);

//export terrains
let aFiles = fs.readdirSync("UFO/TERRAIN");
await aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "TERRAIN",
			palettes: ufoPalettes,
			pckPath: `${process.cwd()}/UFO/TERRAIN/${sFilename}`,
			tabPath: `${process.cwd()}/UFO/TERRAIN/${sFilename.replace(".PCK", ".TAB")}`
		});
		await oPck.load();
		//oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
		await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/terrain/${sFilename}.png`);
	}
});

//export ufograph
aFiles = fs.readdirSync(`${process.cwd()}/UFO/UFOGRAPH`);
await aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		//console.log(fs.statSync(sFilename));
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "UFOGRAPH",
			palettes: ufoPalettes,
			pckPath: `${process.cwd()}/UFO/UFOGRAPH/${sFilename}`,
			tabPath: `${process.cwd()}/UFO/UFOGRAPH/${sFilename.replace(".PCK", ".TAB")}`
		});
		await oPck.load();
		if (oPck.valid){
			//oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
			await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/ufograph/${sFilename}.png`);
		}
	}
});
//export geograph

let oPck = new PckFile({
	fileName: "BASEBITS.PCK",
	fileType: "GEOGRAPH",
	palettes: ufoPalettes,
	pckPath: `${process.cwd()}/UFO/GEOGRAPH/BASEBITS.PCK`,
	tabPath: `${process.cwd()}/UFO/GEOGRAPH/BASEBITS.TAB`
});
await oPck.load();
if (oPck.valid){
	//oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
	await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/geograph/BASEBITS.PCK.png`);
}

 oPck = new PckFile({
	fileName: "INTICON.PCK",
	fileType: "GEOGRAPH",
	palettes: ufoPalettes,
	pckPath: `${process.cwd()}/UFO/GEOGRAPH/INTICON.PCK`,
	tabPath: `${process.cwd()}/UFO/GEOGRAPH/INTICON.TAB`
});
await oPck.load();
if (oPck.valid){
	//oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
	await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/geograph/INTICON.PCK.png`);
}
//export units
aFiles = fs.readdirSync("UFO/UNITS");
await aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "UNITS",
			palettes: ufoPalettes,
			pckPath: `${process.cwd()}/UFO/UNITS/${sFilename}`,
			tabPath: `${process.cwd()}/UFO/UNITS/${sFilename.replace(".PCK", ".TAB")}`
		});
		await oPck.load();
		//oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
		await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/units/${sFilename}.png`);
	}
});

let oScanG = new ScanG("./UFO/GEODATA/SCANG.DAT", ufoPalettes);
await oScanG.loadData();
await oScanG.exportPNG(`${process.cwd()}/exports/ufo/geodata/SCANG.DAT.png`)
