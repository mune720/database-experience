const textInput = document.querySelector("#textInput");
const savedEncoding = document.querySelector("#savedEncoding");
const resetButton = document.querySelector("#resetButton");
const sampleButtons = document.querySelectorAll(".sample-button");
const byteGrid = document.querySelector("#byteGrid");
const readingGrid = document.querySelector("#readingGrid");
const codePointList = document.querySelector("#codePointList");
const byteCount = document.querySelector("#byteCount");
const charCount = document.querySelector("#charCount");
const messageArea = document.querySelector("#messageArea");
const byteCaption = document.querySelector("#byteCaption");
const summaryText = document.querySelector("#summaryText");

const initialText = textInput.value;
const encodings = ["utf8", "shift_jis", "euc-jp", "utf16le"];
const encodingLabels = {
  utf8: "Unicode (UTF-8)",
  shift_jis: "Shift_JIS",
  "euc-jp": "EUC-JP",
  utf16le: "Unicode (UTF-16LE)"
};
const decoderLabels = {
  utf8: "utf-8",
  shift_jis: "shift_jis",
  "euc-jp": "euc-jp",
  utf16le: "utf-16le"
};
const reverseMaps = buildReverseMaps(window.ENCODING_MAPS || {});

textInput.addEventListener("input", updateExperience);
savedEncoding.addEventListener("change", updateExperience);
resetButton.addEventListener("click", () => {
  textInput.value = initialText;
  savedEncoding.value = "shift_jis";
  updateExperience();
});

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    textInput.value = button.dataset.sample;
    updateExperience();
  });
});

updateExperience();

function updateExperience() {
  try {
    const data = analyzeText(textInput.value, savedEncoding.value);
    render(data);
    setMessage("");
  } catch (error) {
    setMessage(error.message || "解析できませんでした。", true);
  }
}

function analyzeText(text, savedAs) {
  const encoded = encodeText(text, savedAs);
  const readings = encodings.map((encoding) => {
    const decoded = decodeBytes(encoded.bytes, encoding);
    return {
      encoding,
      label: encodingLabels[encoding],
      text: decoded,
      matchesOriginal: decoded === text,
      replacementCount: countMatches(decoded, "\uFFFD"),
      questionCount: countMatches(decoded, "?")
    };
  });
  const correctReading = readings.find((reading) => reading.encoding === savedAs);

  return {
    sourceText: text,
    savedAs,
    savedAsLabel: encodingLabels[savedAs],
    byteLength: encoded.bytes.length,
    bytes: encoded.bytes,
    hex: encoded.bytes.map(toHex),
    unsupported: encoded.unsupported,
    correctReadingMatchesOriginal: correctReading ? correctReading.matchesOriginal : false,
    codePoints: Array.from(text).map((char) => ({
      char,
      codePoint: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
      utf8Hex: encodeText(char, "utf8").bytes.map(toHex)
    })),
    readings
  };
}

function encodeText(text, encoding) {
  if (encoding === "utf8") {
    return {
      bytes: Array.from(new TextEncoder().encode(text)),
      unsupported: []
    };
  }

  if (encoding === "utf16le") {
    const bytes = [];
    for (let i = 0; i < text.length; i += 1) {
      const codeUnit = text.charCodeAt(i);
      bytes.push(codeUnit & 0xff, codeUnit >> 8);
    }
    return { bytes, unsupported: [] };
  }

  const map = (window.ENCODING_MAPS || {})[encoding];
  if (!map) {
    throw new Error(`${encodingLabels[encoding] || encoding} の対応表が見つかりません。`);
  }

  const bytes = [];
  const unsupported = [];

  for (const char of Array.from(text)) {
    const key = char.codePointAt(0).toString(16).toUpperCase();
    const mapped = map[key];

    if (mapped) {
      bytes.push(...mapped);
      continue;
    }

    bytes.push(0x3f);
    unsupported.push({
      char,
      codePoint: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`
    });
  }

  return { bytes, unsupported };
}

function decodeBytes(bytes, encoding) {
  try {
    return new TextDecoder(decoderLabels[encoding], { fatal: false }).decode(new Uint8Array(bytes));
  } catch {
    return decodeBytesWithMap(bytes, encoding);
  }
}

function decodeBytesWithMap(bytes, encoding) {
  if (encoding === "utf8") {
    return decodeUtf8Fallback(bytes);
  }

  if (encoding === "utf16le") {
    let output = "";
    for (let i = 0; i < bytes.length; i += 2) {
      output += String.fromCharCode((bytes[i] || 0) | ((bytes[i + 1] || 0) << 8));
    }
    return output;
  }

  const map = reverseMaps[encoding] || {};
  let output = "";

  for (let i = 0; i < bytes.length;) {
    let matched = null;

    for (const length of [3, 2, 1]) {
      const key = bytes.slice(i, i + length).join("-");
      if (map[key]) {
        matched = { char: map[key], length };
        break;
      }
    }

    if (matched) {
      output += matched.char;
      i += matched.length;
      continue;
    }

    if (bytes[i] <= 0x7f) {
      output += String.fromCharCode(bytes[i]);
    } else {
      output += "\uFFFD";
    }
    i += 1;
  }

  return output;
}

function decodeUtf8Fallback(bytes) {
  let output = "";

  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    if (byte < 0x80) {
      output += String.fromCharCode(byte);
    } else {
      output += "\uFFFD";
    }
  }

  return output;
}

function buildReverseMaps(maps) {
  const result = {};

  Object.entries(maps).forEach(([encoding, map]) => {
    result[encoding] = {};
    Object.entries(map).forEach(([codePointHex, bytes]) => {
      result[encoding][bytes.join("-")] = String.fromCodePoint(parseInt(codePointHex, 16));
    });
  });

  return result;
}

function render(data) {
  const charLength = Array.from(data.sourceText).length;
  byteCount.textContent = String(data.byteLength);
  charCount.textContent = String(charLength);
  byteCaption.textContent = `${data.savedAsLabel} で保存した時の 16 進数です。`;
  summaryText.textContent = buildSummary(data);

  renderBytes(data.hex);
  renderReadings(data);
  renderCodePoints(data.codePoints);
}

function buildSummary(data) {
  if (data.unsupported.length > 0) {
    return `${data.savedAsLabel} では表現できない文字が ${data.unsupported.length} 個あり、保存時に ? へ置き換わります。`;
  }
  return `${data.savedAsLabel} で保存したバイト列を、下の4種類の読み方で比較します。`;
}

function renderBytes(hexBytes) {
  byteGrid.innerHTML = "";

  if (!hexBytes.length) {
    byteGrid.append(createEmptyState("文字を入力すると、ここにバイト列が出ます。"));
    return;
  }

  hexBytes.forEach((hex, index) => {
    const item = document.createElement("span");
    item.className = "byte-item";
    item.title = `${index + 1} バイト目`;
    item.textContent = hex;
    byteGrid.append(item);
  });
}

function renderReadings(data) {
  readingGrid.innerHTML = "";

  data.readings.forEach((reading) => {
    const card = document.createElement("article");
    const isSavedEncoding = reading.encoding === data.savedAs;
    const isClean = reading.matchesOriginal;
    card.className = `reading-card ${isClean ? "is-clean" : "is-broken"}`;

    const header = document.createElement("div");
    header.className = "reading-header";

    const title = document.createElement("h2");
    title.textContent = reading.label;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = isClean ? "元の文字" : isSavedEncoding ? "保存時に欠落" : "文字化け";

    header.append(title, badge);

    const output = document.createElement("pre");
    output.textContent = reading.text || "(空)";

    const note = document.createElement("p");
    note.className = "reading-note";
    note.textContent = buildReadingNote(reading, data, isSavedEncoding);

    card.append(header, output, note);
    readingGrid.append(card);
  });
}

function renderCodePoints(codePoints) {
  codePointList.innerHTML = "";

  if (!codePoints.length) {
    codePointList.append(createEmptyState("文字を入力すると、Unicode 番号が出ます。"));
    return;
  }

  codePoints.forEach((item) => {
    const row = document.createElement("div");
    row.className = "codepoint-row";

    const char = document.createElement("strong");
    char.textContent = item.char;

    const code = document.createElement("span");
    code.textContent = item.codePoint;

    const utf8 = document.createElement("small");
    utf8.textContent = `UTF-8: ${item.utf8Hex.join(" ")}`;

    row.append(char, code, utf8);
    codePointList.append(row);
  });
}

function buildReadingNote(reading, data, isSavedEncoding) {
  if (reading.matchesOriginal) {
    return isSavedEncoding ? `${data.savedAsLabel} として読むと正しく戻ります。` : "偶然この読み方でも同じ表示になりました。";
  }
  if (isSavedEncoding && data.unsupported.length > 0) {
    return `保存できない文字: ${data.unsupported.map((item) => item.char).join(" ")}`;
  }
  if (reading.replacementCount > 0) {
    return `読めないバイトが ${reading.replacementCount} 個あり、� で表示されています。`;
  }
  if (reading.questionCount > 0) {
    return "? は、保存時の置き換えか誤読の結果として見えることがあります。";
  }
  return "同じバイト列を別の表で読んだため、違う文字として表示されています。";
}

function createEmptyState(text) {
  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

function setMessage(text, isError = false) {
  messageArea.textContent = text;
  messageArea.classList.toggle("error", isError);
}

function countMatches(text, needle) {
  return Array.from(text).filter((char) => char === needle).length;
}

function toHex(byte) {
  return byte.toString(16).toUpperCase().padStart(2, "0");
}
