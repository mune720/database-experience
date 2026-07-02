const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const encodings = ["shift_jis", "euc-jp"];
const outputPath = path.join(__dirname, "..", "public", "encoding-maps.js");
const maps = {};

for (const encoding of encodings) {
  const map = {};

  for (let codePoint = 0; codePoint <= 0xffff; codePoint += 1) {
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      continue;
    }

    const char = String.fromCodePoint(codePoint);
    const encoded = iconv.encode(char, encoding);
    const decoded = iconv.decode(encoded, encoding);

    if (decoded === char) {
      map[codePoint.toString(16).toUpperCase()] = Array.from(encoded);
    }
  }

  maps[encoding] = map;
}

const content = `window.ENCODING_MAPS = ${JSON.stringify(maps)};\n`;
fs.writeFileSync(outputPath, content);
console.log(`Wrote ${outputPath}`);
