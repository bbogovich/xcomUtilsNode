import { Palettes } from "../src/xcom/palettes.js";
const ufoPalettes = new Palettes("UFO", "UFO");
console.log(`Working directory is ${process.cwd()}`)
await ufoPalettes.loadPalettesDat();
await ufoPalettes.loadBackpalsDat();
await ufoPalettes.exportPNG(ufoPalettes.geoscapePalette, `${process.cwd()}/exports/ufo/geoscape.png`);
await ufoPalettes.exportPNG(ufoPalettes.graphPalette, `${process.cwd()}/exports/ufo/graph.png`);
await ufoPalettes.exportPNG(ufoPalettes.basePalette, `${process.cwd()}/exports/ufo/base.png`);
await ufoPalettes.exportPNG(ufoPalettes.researchPalette, `${process.cwd()}/exports/ufo/research.png`);
await ufoPalettes.exportPNG(ufoPalettes.tacticalPalettes[0], `${process.cwd()}/exports/ufo/tactical.png`);


const tftdPalettes = new Palettes("TFTD", "TFTD");
console.log(`Working directory is ${process.cwd()}`)
await tftdPalettes.loadPalettesDat();
await tftdPalettes.loadBackpalsDat();
await tftdPalettes.exportPNG(tftdPalettes.geoscapePalette, `${process.cwd()}/exports/tftd/geoscape.png`);
await tftdPalettes.exportPNG(tftdPalettes.graphPalette, `${process.cwd()}/exports/tftd/graph.png`);
await tftdPalettes.exportPNG(tftdPalettes.basePalette, `${process.cwd()}/exports/tftd/base.png`);
await tftdPalettes.exportPNG(tftdPalettes.researchPalette, `${process.cwd()}/exports/tftd/research.png`);
await tftdPalettes.exportPNG(tftdPalettes.tacticalPalettes[0], `${process.cwd()}/exports/tftd/tactical0.png`);
await tftdPalettes.exportPNG(tftdPalettes.tacticalPalettes[1], `${process.cwd()}/exports/tftd/tactical1.png`);
await tftdPalettes.exportPNG(tftdPalettes.tacticalPalettes[2], `${process.cwd()}/exports/tftd/tactical2.png`);
await tftdPalettes.exportPNG(tftdPalettes.tacticalPalettes[3], `${process.cwd()}/exports/tftd/tactical3.png`);
