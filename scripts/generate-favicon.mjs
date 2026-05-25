import { writeFileSync } from "node:fs";

const sizes = [16, 32, 48];

const colors = {
  bg: [17, 18, 24, 255],
  bg2: [34, 31, 48, 255],
  accent: [255, 116, 81, 255],
  gold: [255, 204, 112, 255],
  white: [248, 248, 246, 255],
  shadow: [0, 0, 0, 95]
};

const glyphA = [
  "01110",
  "10001",
  "10001",
  "11111",
  "10001",
  "10001",
  "10001"
];

function mix(a, b, t) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t));
}

function makePixels(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;

  const setPixel = (x, y, rgba) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const offset = (y * size + x) * 4;
    pixels[offset] = rgba[0];
    pixels[offset + 1] = rgba[1];
    pixels[offset + 2] = rgba[2];
    pixels[offset + 3] = rgba[3];
  };

  const blendPixel = (x, y, rgba) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const offset = (y * size + x) * 4;
    const alpha = rgba[3] / 255;
    pixels[offset] = Math.round(rgba[0] * alpha + pixels[offset] * (1 - alpha));
    pixels[offset + 1] = Math.round(rgba[1] * alpha + pixels[offset + 1] * (1 - alpha));
    pixels[offset + 2] = Math.round(rgba[2] * alpha + pixels[offset + 2] * (1 - alpha));
    pixels[offset + 3] = 255;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const gradient = (x + y) / (size * 2);
      setPixel(x, y, mix(colors.bg, colors.bg2, gradient));
    }
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x - cx, y - cy);
      const ring = Math.abs(distance - size * 0.39);
      if (ring < Math.max(0.8, size * 0.035) && x > y * 0.55) {
        blendPixel(x, y, colors.accent);
      }
      if (x + y > size * 1.22 && x - y > size * 0.04) {
        blendPixel(x, y, [255, 116, 81, 65]);
      }
    }
  }

  const scale = Math.max(1, Math.floor(size / 15));
  const gap = scale;
  const glyphWidth = glyphA[0].length * scale;
  const glyphHeight = glyphA.length * scale;
  const totalWidth = glyphWidth * 2 + gap;
  const startX = Math.floor((size - totalWidth) / 2);
  const startY = Math.floor((size - glyphHeight) / 2) + Math.max(0, Math.floor(size / 18));

  const drawGlyph = (originX, originY, rgba) => {
    for (let row = 0; row < glyphA.length; row += 1) {
      for (let col = 0; col < glyphA[row].length; col += 1) {
        if (glyphA[row][col] !== "1") continue;
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            blendPixel(originX + col * scale + sx, originY + row * scale + sy, rgba);
          }
        }
      }
    }
  };

  drawGlyph(startX + 1, startY + 1, colors.shadow);
  drawGlyph(startX + glyphWidth + gap + 1, startY + 1, colors.shadow);
  drawGlyph(startX, startY, colors.white);
  drawGlyph(startX + glyphWidth + gap, startY, colors.gold);

  return pixels;
}

function makeDib(size) {
  const pixels = makePixels(size);
  const bytesPerPixelRow = size * 4;
  const maskBytesPerRow = Math.ceil(size / 32) * 4;
  const header = Buffer.alloc(40);
  const bitmap = Buffer.alloc(bytesPerPixelRow * size);
  const mask = Buffer.alloc(maskBytesPerRow * size);

  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(bitmap.length, 20);
  header.writeInt32LE(0, 24);
  header.writeInt32LE(0, 28);
  header.writeUInt32LE(0, 32);
  header.writeUInt32LE(0, 36);

  for (let y = 0; y < size; y += 1) {
    const sourceY = size - 1 - y;
    for (let x = 0; x < size; x += 1) {
      const src = (sourceY * size + x) * 4;
      const dst = y * bytesPerPixelRow + x * 4;
      bitmap[dst] = pixels[src + 2];
      bitmap[dst + 1] = pixels[src + 1];
      bitmap[dst + 2] = pixels[src];
      bitmap[dst + 3] = pixels[src + 3];
    }
  }

  return Buffer.concat([header, bitmap, mask]);
}

const images = sizes.map((size) => ({ size, data: makeDib(size) }));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(0, 0);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);

let offset = directory.length;
for (let index = 0; index < images.length; index += 1) {
  const entry = 6 + index * 16;
  const image = images[index];
  directory[entry] = image.size;
  directory[entry + 1] = image.size;
  directory[entry + 2] = 0;
  directory[entry + 3] = 0;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.data.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.data.length;
}

writeFileSync("public/favicon.ico", Buffer.concat([directory, ...images.map((image) => image.data)]));
