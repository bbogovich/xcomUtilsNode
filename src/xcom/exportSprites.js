import { Palettes } from "./palettes.js";
import { PckFile } from "./pck.js";
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
aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "TERRAIN",
			palette: ufoPalettes.tacticalPalettes[0]
		});
		await oPck.load();
		oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
		await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/terrain/${sFilename}.png`);
	}
});

//export ufograph
aFiles = fs.readdirSync("UFO/UFOGRAPH");
aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "UFOGRAPH",
			palette: ufoPalettes.tacticalPalettes[0]
		});
		await oPck.load();
		if (oPck.valid){
			oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
			await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/ufograph/${sFilename}.png`);
		}
	}
});
//export geograph

let oPck = new PckFile({
	fileName: "BASEBITS.PCK",
	fileType: "GEOGRAPH",
	palette: ufoPalettes.basePalette
});
await oPck.load();
if (oPck.valid){
	oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
	await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/geograph/BASEBITS.PCK.png`);
}

 oPck = new PckFile({
	fileName: "INTICON.PCK",
	fileType: "GEOGRAPH",
	palette: ufoPalettes.geoscapePalette
});
await oPck.load();
if (oPck.valid){
	oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
	await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/geograph/INTICON.PCK.png`);
}
//export units
aFiles = fs.readdirSync("UFO/UNITS");
aFiles.forEach(async (sFilename)=>{
	if (sFilename.endsWith(".PCK")){
		let oPck = new PckFile({
			fileName: sFilename,
			fileType: "UNITS",
			palette: ufoPalettes.tacticalPalettes[0]
		});
		await oPck.load();
		oPck.sprites.forEach((oSprite)=>{oPck.logPck(oSprite)})
		await oPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/units/${sFilename}.png`);
	}
});
