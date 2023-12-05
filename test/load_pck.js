import { Palettes } from "../src/xcom/palettes.js";
import { PckFile } from "../src/xcom/pck.js";
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

if (!fs.existsSync(`${process.cwd()}/exports/ufo/terrain`)){
	fs.mkdirSync(`${process.cwd()}/exports/ufo/terrain`);
}

const ufoPalettes = new Palettes("UFO", "UFO");
await ufoPalettes.loadPalettesDat();
await ufoPalettes.exportPNG(ufoPalettes.tacticalPalettes[0], `${process.cwd()}/exports/ufo/palettes/tactical.png`);

let avengerPck = new PckFile({
	fileName: "AVENGER",
	fileType: "TERRAIN",
	palette: ufoPalettes.tacticalPalettes[0]
});
await avengerPck.load();
await avengerPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/terrain/avenger.png`);
let sectoidPck = new PckFile({
	fileName: "SECTOID",
	fileType: "UNITS",
	palette: ufoPalettes.tacticalPalettes[0]
});
await sectoidPck.load();
sectoidPck.sprites.forEach(async (oSprite, i)=>{
	sectoidPck.logPck(oSprite);
	//await sectoidPck.exportSprite(`${process.cwd()}/exports/ufo/units/sectoid_${oSprite.offset.toString(16)}.png`, i);
});
await sectoidPck.exportSpriteSheet(`${process.cwd()}/exports/ufo/units/sectoid.png`);
console.log("yay");

//look up entries based on the tab file
//todo: why does this only find three?
sectoidPck.tabIndex.forEach(async (nTabIndex, i)=>{
	console.log(nTabIndex.toString(16));
	for (let i = 0; i < sectoidPck.sprites.length; i++){
		let oSprite = sectoidPck.sprites[i];
		if (oSprite.offset === nTabIndex){
			console.log("found");
				await sectoidPck.exportSprite(`${process.cwd()}/exports/ufo/units/sectoid_tab_${nTabIndex}.png`, i);
		}
	}
});
