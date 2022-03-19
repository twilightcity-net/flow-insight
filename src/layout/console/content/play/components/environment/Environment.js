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

  unload(p5) {
    //TODO unload the image cache so we're not running out of memory
  }

  //override these in subclasses, or leave as default if not used.

  hasFervieMovingNorth(fervie) {
    return false;
  }

  getDefaultSpawnProperties() {
    return this.getLeftSpawnProperties();
  }

  getLeftSpawnProperties() { return {x: this.width/2, y: this.height/2, scale: 1}; }

  getRightSpawnProperties() { return {x: this.width/2, y: this.height/2, scale: 1}; }

  getNorthSpawnProperties()  { return {x: this.width/2, y: this.height/2, scale: 1}; }

  getSouthSpawnProperties()  { return {x: this.width/2, y: this.height/2, scale: 1}; }

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
