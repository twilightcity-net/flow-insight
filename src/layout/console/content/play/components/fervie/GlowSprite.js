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
    this.frameCount = 1;
    this.starAlpha = 0.0;
    this.secondAlpha = 0.0;
    this.alphaDecayRate = 0.04;
    this.fastDecayRate = 0.1;
    this.isDisappearing = false;
    this.isReappearing = false;

    this.flicker = 0;
    this.flickerRate = 2;

    this.isVisible = false;

    this.hasSecondary = false;
    this.secondaryX = 0;
    this.secondaryY = 0;
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

    this.drawSecondary(p5);

    p5.pop();

  }

  drawSecondary(p5) {
    let t = this.frameCount;
    if (this.hasSecondary) {
      p5.noFill();
      p5.stroke("rgba(255,255,255,"+this.secondAlpha +")");
      p5.strokeWeight(4);

      p5.translate(75, 75);
      p5.rotate(t/10);
      p5.ellipse(0, 0, p5.sin(t / 30)*100, p5.cos(t / 13)*100);
      p5.ellipse(0, 0, p5.cos(t / 13)*100, p5.sin(t / 30)*100);
    }
  }

  startDisappear() {
    this.isDisappearing = true;
    this.isReappearing = false;
    this.starAlpha = 1.0;
    this.hasSecondary = false;
  }

  startDisappearIfVisible() {
    if (this.isVisible && !this.isDisappearing) {
      this.startDisappear();
    }
    this.hasSecondary = false;
  }

  startReappear() {
    this.isReappearing = true;
    this.isDisappearing = false;
    this.starAlpha = 0.0;
  }

  startSecondaryGlow() {
    this.hasSecondary = true;
    this.secondAlpha = 0;
    this.frameCount = 1;
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
    this.frameCount++;

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

    if (this.hasSecondary) {
      this.secondAlpha += 0.01;
      if (this.secondAlpha > 0.1) {
        this.secondAlpha = 0.1;
      }
    }

  }
}
