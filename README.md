# xcomUtilsNode
Node.js utility scripts for XCom/TFTD

## Progress:
 - Palettes loading for UFO
 - TFTD palettes loading except for tactical, which appear scrambled
 - PCK loader appears to successfully unpack sprite data
 - TAB files may be correct?  Still unclear what exactly they do.
 - Export unit to sprite sheet works
 - Export terrain to sprite sheet appears to be incomplete data?

## Usage
 - `npm install`
 - `npm run test:palettes` Export palettes to PNG files
 - `npm run export:ufo` Export PCK files to PNG sprite sheets

## References
X-Com File Formats (UfoPaedia.org)
 - [PCK File Format](https://www.ufopaedia.org/index.php/Image_Formats#PCK)
 - [Palette Format](https://www.ufopaedia.org/index.php/PALETTES.DAT)

### Canvas API

 - [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas)
 - [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

## Dependencies

[canvas module](https://github.com/Automattic/node-canvas) for Node.js
 is used to generate PNG files.  No release build is currently available for ARM based Macs, so it must be built from source (see node-canvas readme)
