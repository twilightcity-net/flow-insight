/**
 * Creates consistent animationIds for use across various dependencies that use animations
 */

export default class AnimationId {
  /**
   * static enum subclass to store animation types
   * @constructor
   */
  static get Animation() {
    return {
      FervieWalkUp: "FervieWalkUp",
      FervieWalkDown: "FervieWalkDown",
      FervieWalkRight: "FervieWalkRight",
      FervieGlow: "FervieGlow",
      FervieKiss: "FervieKiss",
      ShroomHouse: "ShroomHouse",
      LadyFervie: "LadyFervie",
      MoovieFervie: "MoovieFervie",
      CityStreetSigns: "CityStreetSigns",
    };
  }

  static get Accessory() {
    return {
      SunglassRight: "SunglassRight",
      SunglassDown: "SunglassDown",
      HeartglassRight: "HeartglassRight",
      HeartglassDown: "HeartglassDown"
    }
  }

  static getFrameOnTwos(animationFrame) {
    return (
      Math.floor((parseInt(animationFrame, 10) - 1) / 2) + 1
    );
  }

  static getIdOn12(animationName, animationFrame) {
    return animationName + "_" + animationFrame;
  }

  static getIdOn24(animationName, animationFrame) {
    let frameOnTwos = this.getFrameOnTwos(animationFrame);
    return animationName + "_" + frameOnTwos;
  }
}
