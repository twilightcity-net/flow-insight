/**
 * Creates our cow sprite animation
 */

export default class ConciergeCowSprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.animationFrame = 1;
  }

  static COW_IMAGE = "./assets/animation/theater/concierge_cow.png";
  static COW_LOOK_IMAGE = "./assets/animation/theater/concierge_cow_look.png";
  static COW_BLINK_IMAGE = "./assets/animation/theater/concierge_cow_blink.png";

  static UNSCALED_IMAGE_WIDTH = 333;
  static UNSCALED_IMAGE_HEIGHT = 329;

  /**
   * Preload all the images for the cow blink
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_IMAGE);
    this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_LOOK_IMAGE);
    this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_BLINK_IMAGE);
  }

  /**
   * Draw the cow sprite on the screen based on the properties
   * @param p5
   */
  draw(p5, fervie, environment) {
    //24 frames per second, blinks every 5 seconds for ~1/4 second

    let image = null;

    p5.push();
    p5.translate(this.x, this.y);
    p5.scale(this.scale, this.scale);

    if (this.isNextToCow(fervie, environment)) {
      image = this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_IMAGE);
    } else {
      image = this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_LOOK_IMAGE);
    }
    p5.image(image, 0, 0);

    if (this.animationFrame >= 115) {
      image = this.animationLoader.getStaticImage(p5, ConciergeCowSprite.COW_BLINK_IMAGE);
      p5.image(image, 0, 0);
    }

    p5.pop();
  }

  isNextToCow(fervie, environment) {
    return (fervie.getFervieFootX() / environment.scaleAmountX < 400 && fervie.getFervieFootY() / environment.scaleAmountY > 400);
  }

  /**
   * Update the cow sprite properties for each subsequent frame,
   * updating the relative frame number for tracking the blink loop
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 120) {
      this.animationFrame = 1;
    }
  }
}
