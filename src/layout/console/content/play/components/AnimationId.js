
/**
 * Creates consistent animationIds for use across various dependencies that use animations
 */

export default class AnimationId {

  /**
   * static enum subclass to store animation types
   * @returns {{FervieWalkUp: string, FervieWalkDown: string, FervieWalkRight: string}}
   * @constructor
   */
  static get Animation() {
    return {
      FervieWalkUp: "FervieWalkUp",
      FervieWalkDown: "FervieWalkDown",
      FervieWalkRight: "FervieWalkRight"
    }
  }

  static getFrameOnTwos(animationFrame) {
    return ((Math.floor((parseInt(animationFrame, 10) - 1 )/2))) + 1;
  }

  static getIdOn12(animationName, animationFrame) {
    return animationName + "_" + animationFrame;
  }

  static getIdOn24(animationName, animationFrame) {
    console.log("animation frame = "+animationFrame);

    let frameOnTwos = this.getFrameOnTwos(animationFrame);
    console.log("frame on twos = "+frameOnTwos);

    return animationName + "_" + frameOnTwos;
  }
}
