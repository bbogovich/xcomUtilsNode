import { PckFile } from "../src/xcom/pck.js";
let avengerPck = new PckFile({
	fileName: "AVENGER"
});
await avengerPck.loadTab();
await avengerPck.loadPck();

let sectoidPck = new PckFile({
	fileName: "SECTOID",
	fileType: "UNITS"
});
sectoidPck.loadTab();
sectoidPck.loadPck();
