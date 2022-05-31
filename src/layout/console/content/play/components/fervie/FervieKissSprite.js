import AnimationId from "../AnimationId";

/**
 * Creates our fervie kiss sprite animation
 */

export default class FervieKissSprite {
  constructor(animationLoader, size) {
    this.animationLoader = animationLoader;
    this.size = size * 0.47;
    this.animationFrame = 1;

    this.isVisible = true;
  }

  static UNSCALED_IMAGE_WIDTH = 234;
  static UNSCALED_IMAGE_HEIGHT = 399;

  /**
   * Preload the fervie kiss image colored with the configured fervie colors
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getAnimationImageWithManualFrame(
      p5,
      AnimationId.Animation.FervieKiss,
      1,
      this.size
    );
  }

  /**
   * Clear cached images and reload when fervie is changing colors
   * @param p5
   */
  reloadImages(p5) {
    this.animationLoader.clearSingleAnimationFrameCache(AnimationId.Animation.FervieKiss, 1);
    this.preload(p5);
  }

  /**
   * Draw the kissing fervie sprite on the screen based on the properties
   * @param p5
   * @param x
   * @param y
   * @param scale
   */
  draw(p5, x, y, scale) {
    let image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.FervieKiss, 1, this.size);

    p5.push();
    p5.translate(
      x + Math.round((this.size/2) * (1 - scale)) + 90,
      y + 5
    );
    p5.scale(scale, scale);
    p5.image(image, 0, 0);
    p5.pop();
  }

  drawMirror(p5, x, y, scale) {
    let image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.FervieKiss, 1, this.size);

    p5.push();
    p5.translate(
      x + Math.round((this.size / 2) * (1 - scale)) + 90,
      y + 5
    );
    p5.scale(scale, scale);
    p5.scale(-1, 1);
    p5.translate(-1*this.size, 0);
    p5.image(image, 0, 0);
    p5.pop();
  }

  /**
   * Update the fervie
   */
  update(p5, environment) {
  }
}
