import AnimationId from "../AnimationId";

/**
 * Creates our fervie sit sprite animation
 */

export default class FervieSitSprite {
  constructor(animationLoader, size) {
    this.animationLoader = animationLoader;
    this.size = size;
    this.animationFrame = 1;

    this.isVisible = true;
  }

  static UNSCALED_IMAGE_WIDTH = 543;
  static UNSCALED_IMAGE_HEIGHT = 443;

  /**
   * Preload the fervie sit image colored with the configured fervie colors
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.FervieWalkUp, 1, this.size);
  }

  /**
   * Draw the sitting fervie sprite on the screen based on the properties
   * @param p5
   * @param x
   * @param y
   * @param scale
   */
  draw(p5, x, y, scale) {
    let image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.FervieWalkUp, 1, this.size);

    p5.push();
    p5.translate(x + Math.round((this.size/2) * (1 - scale)), y + (120 * scale));
    p5.scale(scale, scale);
    p5.image(image, 0, 0);
    p5.pop();
  }

  /**
   * Update the fervie
   */
  update(p5, environment) {
  }
}
