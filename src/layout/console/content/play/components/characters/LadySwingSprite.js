/**
 * Creates our lady swinging on the swing sprite animation
 */

export default class LadySwingSprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;

    this.animationFrame = 1;
    this.x = x;
    this.y = y;
    this.scale = scale;

  }

  static UNSCALED_IMAGE_WIDTH = 289;
  static UNSCALED_IMAGE_HEIGHT = 578;

  static SWING_BACK = "./assets/animation/fervie/fervie_lady_swing_back.png";
  static SWING_BACK_FAR = "./assets/animation/fervie/fervie_lady_swing_back_far.png";
  static SWING_NEUTRAL = "./assets/animation/fervie/fervie_lady_swing_neutral.png";
  static SWING_FORWARD = "./assets/animation/fervie/fervie_lady_swing_forward.png";


  /**
   * Preload all the fervie swing images
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_BACK);
    this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_BACK_FAR);
    this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_NEUTRAL);
    this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_FORWARD);
  }

  /**
   * Draw the swinging fervie lady sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    let image = this.getSwingImageForFrame(p5, this.animationFrame);

    p5.push();
    p5.translate(this.x, this.y - 40);
    p5.scale(this.scale, this.scale);
    p5.image(image, 0, 0);
    p5.pop();
  }

  getSwingImageForFrame(p5, animationFrame) {
    //each sec, swing 1 way.. [stay forward, move, move, stay back, move move]
    if (this.isBetween(animationFrame, 1, 20 )) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_FORWARD);
    }
    if (this.isBetween(animationFrame, 21, 22)) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_NEUTRAL);
    }
    if (this.isBetween(animationFrame, 23, 24)) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_BACK);
    }
    if (this.isBetween(animationFrame, 25, 44)) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_BACK_FAR);
    }
    if (this.isBetween(animationFrame, 45, 46)) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_BACK);
    }
    if (this.isBetween(animationFrame, 47, 48)) {
      return this.animationLoader.getStaticImage(p5, LadySwingSprite.SWING_NEUTRAL);
    }
  }

  isBetween(frame, frameLow, frameHigh) {
    return frame >= frameLow && frame <= frameHigh;
  }


  /**
   * Update the fervie animation properties for each subsequent frame
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 48) {
      this.animationFrame = 1;
    }

  }
}
