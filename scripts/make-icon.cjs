const fs = require('node:fs');
const path = require('node:path');

/**
 * Builds build/icon.ico (16, 24, 32, 48, 64, 128, 256 px) without any
 * external dependency: the artwork is drawn in plain pixel math and packed
 * into Windows ICO / BMP entries.
 */

const MAROON = [141, 16, 14];
const WHITE = [255, 255, 255];
const SIZES = [16, 24, 32, 48, 64, 128, 256];
const SAMPLES = 4;

function roundedRectAlpha(x, y, size, inset, radius) {
  const left = inset;
  const right = size - inset;
  const top = inset;
  const bottom = size - inset;

  if (x < left || x > right || y < top || y > bottom) return 0;

  const cx = Math.min(Math.max(x, left + radius), right - radius);
  const cy = Math.min(Math.max(y, top + radius), bottom - radius);

  const dx = x - cx;
  const dy = y - cy;

  return dx * dx + dy * dy <= radius * radius ? 1 : 0;
}

function barAlpha(x, y, size, top, height, left, right, radius) {
  if (y < top || y > top + height) return 0;
  if (x < left || x > right) return 0;

  const half = height / 2;
  const cy = Math.min(Math.max(y, top + half), top + height - half);
  const cx = Math.min(Math.max(x, left + radius), right - radius);
  const dx = x - cx;
  const dy = y - cy;

  return dx * dx + dy * dy <= radius * radius ? 1 : 0;
}

function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let bgHits = 0;
      let barHits = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = px + (sx + 0.5) / SAMPLES;
          const y = py + (sy + 0.5) / SAMPLES;

          bgHits += roundedRectAlpha(x, y, size, size * 0.04, size * 0.22);

          const unit = size;
          barHits +=
            barAlpha(
              x,
              y,
              unit,
              unit * 0.28,
              unit * 0.1,
              unit * 0.24,
              unit * 0.76,
              unit * 0.05,
            ) +
            barAlpha(
              x,
              y,
              unit,
              unit * 0.45,
              unit * 0.1,
              unit * 0.24,
              unit * 0.76,
              unit * 0.05,
            ) +
            barAlpha(
              x,
              y,
              unit,
              unit * 0.62,
              unit * 0.1,
              unit * 0.24,
              unit * 0.54,
              unit * 0.05,
            );
        }
      }

      const bgAlpha = bgHits / (SAMPLES * SAMPLES);
      const barAlphaValue = Math.min(1, barHits / (SAMPLES * SAMPLES));

      const r = MAROON[0] * (1 - barAlphaValue) + WHITE[0] * barAlphaValue;
      const g = MAROON[1] * (1 - barAlphaValue) + WHITE[1] * barAlphaValue;
      const b = MAROON[2] * (1 - barAlphaValue) + WHITE[2] * barAlphaValue;

      const offset = (py * size + px) * 4;

      pixels[offset] = Math.round(r);
      pixels[offset + 1] = Math.round(g);
      pixels[offset + 2] = Math.round(b);
      pixels[offset + 3] = Math.round(bgAlpha * 255);
    }
  }

  return pixels;
}

function bmpEntry(pixels, size) {
  const headerSize = 40;
  const xorSize = size * size * 4;
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const andSize = maskRowBytes * size;
  const buffer = Buffer.alloc(headerSize + xorSize + andSize);

  buffer.writeUInt32LE(headerSize, 0);
  buffer.writeInt32LE(size, 4);
  buffer.writeInt32LE(size * 2, 8);
  buffer.writeUInt16LE(1, 12);
  buffer.writeUInt16LE(32, 14);
  buffer.writeUInt32LE(0, 16);
  buffer.writeUInt32LE(xorSize + andSize, 20);

  for (let y = 0; y < size; y += 1) {
    const sourceRow = size - 1 - y;
    for (let x = 0; x < size; x += 1) {
      const source = (sourceRow * size + x) * 4;
      const target = headerSize + (y * size + x) * 4;

      buffer[target] = pixels[source + 2];
      buffer[target + 1] = pixels[source + 1];
      buffer[target + 2] = pixels[source];
      buffer[target + 3] = pixels[source + 3];
    }
  }

  return buffer;
}

function buildIco() {
  const entries = SIZES.map((size) => ({
    size,
    data: bmpEntry(renderIcon(size), size),
  }));

  const headerSize = 6;
  const directorySize = entries.length * 16;
  let offset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(directorySize);

  entries.forEach((entry, index) => {
    const base = index * 16;

    directory[base] = entry.size >= 256 ? 0 : entry.size;
    directory[base + 1] = entry.size >= 256 ? 0 : entry.size;
    directory[base + 2] = 0;
    directory[base + 3] = 0;
    directory.writeUInt16LE(1, base + 4);
    directory.writeUInt16LE(32, base + 6);
    directory.writeUInt32LE(entry.data.length, base + 8);
    directory.writeUInt32LE(offset, base + 12);

    offset += entry.data.length;
  });

  return Buffer.concat([header, directory, ...entries.map((e) => e.data)]);
}

const outputDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, 'icon.ico');
fs.writeFileSync(outputPath, buildIco());

console.log(`Saved ${outputPath}`);

const CRC_TABLE = (() => {
  const table = new Int32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;

    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c;
  }

  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;

  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([length, body, crc]);
}

function writePng(filePath, pixels, size) {
  const zlib = require('node:zlib');

  const raw = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(
      raw,
      y * (size * 4 + 1) + 1,
      y * size * 4,
      (y + 1) * size * 4,
    );
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
}

const previewDir = path.join(__dirname, '..', 'sample');
fs.mkdirSync(previewDir, { recursive: true });
writePng(
  path.join(previewDir, 'icon-preview.png'),
  renderIcon(128),
  128,
);

console.log('Saved sample/icon-preview.png');
