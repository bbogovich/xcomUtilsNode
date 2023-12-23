# Notes

# Palettes
Sprites can be edited in photoshop based on a PNG output, but since they are index based an ACT file needs to be generated to input the color palette.

ACT files are pretty simple.  They represent 256 colors with 16 bits per channel for a total of 768 records.  The xcom palettes only use 8 bits, so the high byte for each color is empty.  There is no header or compression on the ACT, it is simply a series of RGB values.  Any leftover colors at the end of the palette should just be zero values.

# PCK Files
Sprites are 32 x 40
The bottom pixel of sprites appears to be transparent
A floor tile is 15px high, so 16 counting the bottom edge.

# TAB Files
Tab files store offsets referencing sprites inside a PCK file.  For UFO, tab files are two bytes, with the low byte first.  For TFTD four bytes are used; byte order TBD.

# Maps
Isometric perspective complicates map calculations somewhat.  Assuming that the top left corner of the map is 0,0.

Each increment on the x-axis shifts a tile by 6 pixels vertically and 16 horizontally (making the floor tiles align).

Each increment on the y-axis shifts a tile by -16 horizontally and 8 vertically

Map cross section vertically is basically the diagonal from top left to bottom right

For a map defined as width x0, depth y0, we then have a displayed height of 

40 + max(8 * y0, 6 * x0)

The displayed width is then of 32 + 16 * x0 + 16 * y0

Each level vertically will be shifted by some amount tbd.

## Coordinate Projections
Let w = display width, h = display height
Let x0, y0 = Sprite 0,0 top left corner

x0 = (w / 2 - 16)
y0 = 0

The origin for a tile x,y is at (x0 + 16 * x - 16 * y), (y0 + 8 * y + 6 * x)

## Alternate tile mapping
It would be simpler to use an image map to determine which tile the curstor is positioned over.  This can be accomplished easily by assigning a unique color to each tile and building a map of color to tile index.  An offscreen buffer can be used to store the tile color rendering.  The tile can then be determined by the color at the cursor coordinates.

