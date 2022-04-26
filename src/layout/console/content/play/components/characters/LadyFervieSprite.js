import AnimationId from "../AnimationId";

/**
 * Creates our fervie sprite animation
 */

export default class LadyFervieSprite {
  constructor(animationLoader, x, y, size) {
    this.animationLoader = animationLoader;
    this.x = x - size / 2 - 10;
    this.y = y - 20;
    this.size = size;
    this.animationFrame = 1;
  }

  static UNSCALED_IMAGE_WIDTH = 376;
  static UNSCALED_IMAGE_HEIGHT = 274;

  /**
   * Preload all the images by processing the svgs with the colors then flattening to images
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getAnimationImageWithManualFrame(
      p5,
      AnimationId.Animation.LadyFervie,
      1,
      this.size
    );
    this.animationLoader.getAnimationImageWithManualFrame(
      p5,
      AnimationId.Animation.LadyFervie,
      2,
      this.size
    );
  }

  /**
   * Draw the fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    //24 frames per second, blinks every 5 seconds for ~1/4 second

    let image = null;

    if (this.animationFrame < 115) {
      image =
        this.animationLoader.getAnimationImageWithManualFrame(
          p5,
          AnimationId.Animation.LadyFervie,
          1,
          this.size
        );
    } else {
      console.log("blink!");
      image =
        this.animationLoader.getAnimationImageWithManualFrame(
          p5,
          AnimationId.Animation.LadyFervie,
          2,
          this.size
        );
    }

    p5.image(image, this.x, this.y);
  }

  /**
   * Update the lady fervie sprite properties for each subsequent frame,
   * updating the relative frame number for tracking the blink loop
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 120) {
      this.animationFrame = 1;
    }
  }
}
