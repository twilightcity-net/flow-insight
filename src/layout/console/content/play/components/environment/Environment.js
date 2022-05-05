/**
 * Parent class for base environment behaviors
 */

export default class Environment {
  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.animationFrame = 1;

    this.width = width;
    this.height = height;
    this.scaleAmountX = width / Environment.IMAGE_WIDTH;
    this.scaleAmountY = height / Environment.IMAGE_HEIGHT;
  }

  //1280 image vs 1129 screen width

  static IMAGE_WIDTH = 1280;
  static IMAGE_HEIGHT = 480;

  preload(p5) {
    p5.cursor(p5.ARROW);
  }

  unload(p5) {
    //TODO unload the image cache so we're not running out of memory
  }

  mousePressed(p5, fervie) {
    console.log("placeholder");
  }

  //override these in subclasses, or leave as default if not used.

  hasFervieMovingNorth(fervie) {
    return false;
  }

  getDefaultSpawnProperties() {
    return this.getLeftSpawnProperties();
  }

  getLeftSpawnProperties() {
    return {
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
    };
  }

  getRightSpawnProperties() {
    return {
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
    };
  }

  getNorthSpawnProperties() {
    return {
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
    };
  }

  getSouthSpawnProperties() {
    return {
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
    };
  }


  /**
   * Returns true if the x,y position is within the target white area within the image
   * @param image
   * @param x
   * @param y
   * @returns {boolean}
   */
  isWithinTargetArea(image, x, y) {
    let color = image.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    if (color && color[0] > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5) {
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
  }
}
