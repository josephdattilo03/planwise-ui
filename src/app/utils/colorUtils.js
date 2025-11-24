// src/app/utils/colorUtils.js
import Color from "colorjs.io";

/**
 * Lighten or darken a color by percentage using Color.js.
 * @param {string} hexColor
 * @param {number} percent - Positive = lighten, negative = darken
 */
export function adjustColor(hexColor, percent) {
  const c = new Color(hexColor);
  const scale = percent / 100;
  const mixColor = scale > 0 ? new Color("white") : new Color("black");
  return c.mix(mixColor, Math.abs(scale)).toString({ format: "hex" });
}

/**
 * Determine if a color is visually dark using relative luminance.
 * @param {string} hexColor
 */
export function isColorDark(hexColor) {
  const c = new Color(hexColor);
  return c.luminance < 0.6;
}

/**
 * Generate text + border colors for a tag based on background.
 * Uses Color.js for correct perceptual blending.
 * @param {string} backgroundColor
 */
export function generateTagColors(backgroundColor) {
  const dark = isColorDark(backgroundColor);

  if (dark) {
    return {
      textColor: "#FFFFFF",
      borderColor: adjustColor(backgroundColor, -10), // lighten by 30%
    };
  } else {
    return {
      textColor: adjustColor(backgroundColor, -50), // darken by 70%
      borderColor: adjustColor(backgroundColor, -20), // darken border slightly
    };
  }
}
