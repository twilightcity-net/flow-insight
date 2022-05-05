/**
 * Creates our fervie glow sprite animation
 */

export default class GlowSprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;
    this.x = x;
    this.y = y;
    this.scale = scale;

    this.animationFrame = 1;
    this.starAlpha = 0.0;
    this.alphaDecayRate = 0.04;
    this.fastDecayRate = 0.1;
    this.isDisappearing = false;
    this.isReappearing = false;

    this.flicker = 0;
    this.flickerRate = 2;

    this.isVisible = false;
  }

  static UNSCALED_IMAGE_WIDTH = 140;
  static UNSCALED_IMAGE_HEIGHT = 197;

  static FERVIE_GLOW_OVERLAY_IMAGE = "./assets/animation/fervie/fervie_glow_overlay.png";

  /**
   * Preload the glow image
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(
      p5,
      GlowSprite.FERVIE_GLOW_OVERLAY_IMAGE
    );
  }

  /**
   * Draw the glowy sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    let glowImage = this.animationLoader.getStaticImage(p5, GlowSprite.FERVIE_GLOW_OVERLAY_IMAGE
    );

    p5.push();
    p5.translate(this.x + (70*(1-this.scale)), this.y - (GlowSprite.UNSCALED_IMAGE_HEIGHT/2*this.scale) + (20*this.scale)); //center glow on input position
    //
    p5.scale(this.scale, this.scale);
    p5.blendMode(p5.ADD);
    p5.tint(255, Math.round((255 + this.flicker) * this.starAlpha));
    p5.image(glowImage, 0, 0);

    p5.pop();
  }

  startDisappear() {
    this.isDisappearing = true;
    this.starAlpha = 1.0;
  }

  startDisappearIfVisible() {
    if (this.isVisible && !this.isDisappearing) {
      this.startDisappear();
    }
  }

  startReappear() {
    this.isReappearing = true;
    this.starAlpha = 0.0;
  }

  isTransitioning() {
    return this.isDisappearing || this.isReappearing;
  }

  /**
   * Update the glow properties for each subsequent frame, depending
   * on if glow is appearing or disappearing
   */
  update(p5) {
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
    if (this.animationFrame % this.flickerRate === 0) {
      this.flicker = p5.random(-10, 0);
    }

    if (this.isDisappearing) {
      this.flicker = 0;
        this.starAlpha -= this.fastDecayRate;
        if (this.starAlpha < 0) {
          this.starAlpha = 0;
          this.isDisappearing = false;
          this.isVisible = false;
        }
    }

    if (this.isReappearing) {
      this.flicker = 0;
      this.isDisappearing = false;

        this.starAlpha += this.alphaDecayRate;
        if (this.starAlpha > 1) {
          this.starAlpha = 1;
          this.isReappearing = false;
          this.isVisible = true;
        }
    }
  }
}
