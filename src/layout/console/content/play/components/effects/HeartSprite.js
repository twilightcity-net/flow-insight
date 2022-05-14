/**
 * Creates our heart sprite animation
 */

export default class HeartSprite {
  constructor(animationLoader, x, y) {
    this.animationLoader = animationLoader;
    this.setPosition(x, y);
    this.scale = 0.5;

    this.floatUpAmount = 0;
    this.alpha = 1;
    this.heartScale = 1;

    this.alphaRate = 0.02;
    this.scaleRate = 0.02;
  }

  static HEART_IMAGE = "./assets/animation/fervie/heart.png";

  static IMAGE_WIDTH = 50;

  /**
   * Preload all the images needed to draw the sprite
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(p5, HeartSprite.HEART_IMAGE);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y - 65;
  }

  /**
   * Draw the sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    let image = this.animationLoader.getStaticImage(p5, HeartSprite.HEART_IMAGE);

    p5.push();
    p5.translate(this.x - (HeartSprite.IMAGE_WIDTH/2*this.scale * this.heartScale), this.y - this.floatUpAmount);

    p5.scale(this.scale, this.scale);
    p5.scale(this.heartScale, this.heartScale);

    p5.tint(255, Math.round(255 * this.alpha));
    p5.image(image, 0, 0);
    p5.pop()
  }

  reset() {
    this.alpha = 1;
    this.floatUpAmount = 0;
    this.heartScale = 1;
  }

  /**
   * Update the heart based on where we are in the animation
   */
  update(p5, environment) {
    this.alpha -= this.alphaRate;
    this.floatUpAmount += 1;
    this.heartScale += this.scaleRate;

    if (this.alpha < 0) {
      this.alpha = 1;
      this.floatUpAmount = 0;
      this.heartScale = 1;
    }

  }
}
