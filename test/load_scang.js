import { Palettes } from "../src/xcom/palettes.js";
import { ScanG } from "../src/xcom/scang.js";

const ufoPalettes = new Palettes("UFO", "UFO");
await ufoPalettes.loadPalettesDat();

let oScanG = new ScanG("UFO/GEODATA/SCANG.DAT", ufoPalettes);
await oScanG.loadData();
await oScanG.exportPNG(`${process.cwd()}/exports/ufo/geodata/SCANG.DAT.png`)
