/**
 * A temporary solution for computing character width, this piece of code is taken from deck.gl
 */
import {document} from 'global';
const MAX_CANVAS_WIDTH = 1024;
const DEFAULT_FONT_SIZE = 64;
const DEFAULT_PADDING = 4;

export const DEFAULT_CHAR_SET = [];
for (let i = 32; i < 128; i++) {
  DEFAULT_CHAR_SET.push(String.fromCharCode(i));
}

function setTextStyle(ctx, fontFamily, fontSize, useAdvancedMetrics) {
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = useAdvancedMetrics ? 'top' : 'hanging';
  ctx.textAlign = 'left';
}

export function makeFontAtlas({
  fontFamily,
  characterSet = DEFAULT_CHAR_SET,
  fontSize = DEFAULT_FONT_SIZE,
  padding = DEFAULT_PADDING
}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  setTextStyle(ctx, fontFamily, fontSize, true);

  // measure texts
  let row = 0;
  let x = 0;
  // Get a sample of text metrics
  // Advanced text metrics are only implemented in Chrome:
  // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
  const {fontBoundingBoxDescent} = ctx.measureText(characterSet[0]);
  // Fallback to height=fontSize
  const fontHeight = fontBoundingBoxDescent || fontSize;
  const useAdvancedMetrics = Boolean(fontBoundingBoxDescent);
  const mapping = {};

  Array.from(characterSet).forEach(char => {
    const {width} = ctx.measureText(char);

    if (x + width > MAX_CANVAS_WIDTH) {
      x = 0;
      row++;
    }
    mapping[char] = {
      x,
      y: row * (fontHeight + padding),
      width,
      height: fontHeight,
      mask: true
    };
    x += width + padding;
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = (row + 1) * (fontHeight + padding);

  setTextStyle(ctx, fontFamily, fontSize, useAdvancedMetrics);
  for (const char in mapping) {
    if (mapping.hasOwnProperty(char)) {
      ctx.fillText(char, mapping[char].x, mapping[char].y);
    }
  }

  return {
    scale: fontHeight / fontSize,
    mapping
  };
}
