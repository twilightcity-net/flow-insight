/**
 * support class for handling fervie color translations
 */
export default class FervieColors {
  static defaultFervieColor = "#B042FF";
  static defaultShoeColor = "#FFFFFF";

  static getShoeInsideColor(shoecolor) {
    let rgb = this.hexToRgb(shoecolor);

    rgb.r -= 70;
    rgb.g -= 70;
    rgb.b -= 70;

    if (rgb.r < 0) {
      rgb.r = 0;
    }

    if (rgb.g < 0) {
      rgb.g = 0;
    }

    if (rgb.b < 0) {
      rgb.b = 0;
    }

    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  static getShoeSoleColor(shoecolor) {
    let rgb = this.hexToRgb(shoecolor);

    rgb.r -= 30;
    rgb.g -= 30;
    rgb.b -= 30;

    if (rgb.r < 0) {
      rgb.r = 0;
    }

    if (rgb.g < 0) {
      rgb.g = 0;
    }

    if (rgb.b < 0) {
      rgb.b = 0;
    }

    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  static rgbToHex(r, g, b) {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
    );
  }

  static hexToRgb(hex) {
    let result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}
