import AnimationId from "../AnimationId";

/**
 * Creates our fervie glow sprite animation
 */

export default class LadyGlowSprite {
  constructor(animationLoader) {
    this.animationLoader = animationLoader;

    this.animationFrame = 1;

    this.alpha = 1.0;
    this.starAlpha = 0.0;
    this.alphaDecayRate = 0.04;
    this.isDisappearing = false;
    this.isReappearing = false;

    this.isVisible = true;
  }

  static UNSCALED_IMAGE_WIDTH = 290;
  static UNSCALED_IMAGE_HEIGHT = 327;

  static FERVIE_GLOW_OVERLAY_IMAGE = "./assets/animation/fervie/fervie_glow_overlay.png";
  static ZEN_GLOW_IMAGE = "./assets/animation/fervie/fervie_lady_glows.png";

  /**
   * Preload all the fervie glow images
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, LadyGlowSprite.ZEN_GLOW_IMAGE);
    this.animationLoader.getStaticImage(p5, LadyGlowSprite.FERVIE_GLOW_OVERLAY_IMAGE);
  }

  /**
   * Draw the glowy fervie lady sprite on the screen based on the properties
   * @param p5
   * @param x
   * @param y
   * @param scale
   */
  draw(p5, x, y, scale) {
    let image = this.animationLoader.getStaticImage(p5, LadyGlowSprite.ZEN_GLOW_IMAGE);
    let overlay = this.animationLoader.getStaticImage(p5, LadyGlowSprite.FERVIE_GLOW_OVERLAY_IMAGE);

    p5.push();
    p5.translate(
      x + Math.round((LadyGlowSprite.UNSCALED_IMAGE_WIDTH / 2) * (1 - scale)) + 45,
      y + 5
    );
    p5.scale(scale, scale);
    p5.tint(255, Math.round(255 * this.alpha));
    p5.image(image, 0, 0);

    p5.blendMode(p5.ADD);
    p5.tint(255, Math.round(255 * this.starAlpha));
    p5.image(overlay, 75, 70);
    p5.blendMode(p5.BLEND);

    p5.pop();
  }

  startDisappear() {
    this.isDisappearing = true;
    this.alpha = 1.0;
    this.starAlpha = 0.0;
    this.bodyDelayFading = 24;
  }

  startReappear() {
    this.isReappearing = true;
    this.alpha = 0.0;
    this.starAlpha = 0.0;
    this.bodyDelayFading = 24;
  }

  startChanneling() {
    this.isFadingIn = true;
    this.isChanneling = true;
    this.alpha = 1.0;
    this.starAlpha = 0.0;
  }

  stopChanneling() {
    this.isFadingIn = false;
    this.isChanneling = true;
    this.isFadingOut = true;
    this.alpha = 1.0;
    this.starAlpha = 0.5;
  }


  isTransitioning() {
    return this.isDisappearing || this.isReappearing || this.isChanneling;
  }

  /**
   * Update the fervie glow properties for each subsequent frame, depending
   * on if fervie is appearing or disappearing
   */
  update(p5, environment) {
    this.bodyDelayFading--;
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }

    if (this.isDisappearing) {
      if (this.bodyDelayFading > 0) {
        this.starAlpha += this.alphaDecayRate;
        if (this.starAlpha > 1) {
          this.starAlpha = 1;
        }
      } else {
        this.alpha -= this.alphaDecayRate;
        this.starAlpha = this.alpha;
        if (this.alpha < 0) {
          this.alpha = 0;
          this.isDisappearing = false;
          this.isVisible = false;
        }
      }
    }

    if (this.isReappearing) {
      this.isDisappearing = false;

      if (this.bodyDelayFading > 0) {
        this.starAlpha += this.alphaDecayRate;
        if (this.starAlpha > 1) {
          this.starAlpha = 1;
        }
      } else {
        this.alpha += this.alphaDecayRate;
        this.starAlpha -= this.alphaDecayRate;
        if (this.starAlpha < 0) {
          this.starAlpha = 0;
        }
        if (this.alpha > 1) {
          this.alpha = 1;
          this.isReappearing = false;
          this.isVisible = true;
        }
      }
    }

    if (this.isChanneling) {
      if (this.isFadingIn) {
        this.starAlpha += this.alphaDecayRate;
        if (this.starAlpha > 0.5) {
          this.starAlpha = 0.5;
          this.isFadingIn = false;
        }
      }
      if (this.isFadingOut) {
        this.starAlpha -= this.alphaDecayRate;
        if (this.starAlpha < 0) {
          this.starAlpha = 0;
          this.isFadingOut = 0;
          this.isChanneling = false;
        }
      }
    }
  }
}
