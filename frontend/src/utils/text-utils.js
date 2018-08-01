import {makeFontAtlas} from './font-atlas';
const DEFAULT_FONT_FAMILY = 'Monaco, monospace';
const MISSING_CHAR_WIDTH = 32;

/**
 * A temporary solution for computing the length of the text being rendered
 * @return {Function} -- A function that compute the length of the given text
 */
export const makeTextLengthComputer = ({
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize,
  characterSet
}) => {
  const {scale, mapping} = makeFontAtlas({fontFamily, fontSize, characterSet});
  return text =>
    text
      ? Array.from(text).reduce(
        (len, letter) =>
          len +
            (mapping.hasOwnProperty(letter)
              ? mapping[letter].width * scale
              : MISSING_CHAR_WIDTH),
        0
      )
      : 0;
};
