/**
 * Creates our fervie glow sprite animation
 */

export default class TreeGlowSprite {
  constructor(animationLoader, x, y) {
    this.animationLoader = animationLoader;
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.animationFrame = 1;

    this.alpha = 0;
    this.alphaDecayRate = 0.04;
    this.isDisappearing = false;
    this.isReappearing = false;

    this.isVisible = false;

    this.isWatchingBird = false;
    this.eyeDirection = TreeGlowSprite.EyePosition.Right;

    this.delayFramesBeforeAppear = 48;
  }

  static GLOW_OVERLAY_IMAGE =
    "./assets/animation/fervie/fervie_glow_overlay.png";
  static TREE_EYES_BLINK =
    "./assets/animation/bigtree/tree_eyes_blink.png";
  static TREE_EYES_DOWN =
    "./assets/animation/bigtree/tree_eyes_down.png";
  static TREE_EYES_RIGHT =
    "./assets/animation/bigtree/tree_eyes_right.png";

  /**
   * static enum subclass to store animation types
   * @returns {{Blink: string, Down: string, Right: string}}
   * @constructor
   */
  static get EyePosition() {
    return {
      Right: "Right",
      Down: "Down",
      Blink: "Blink",
    };
  }

  /**
   * Preload all the walk images by processing the svgs with the colors then flattening to images
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(
      p5,
      TreeGlowSprite.GLOW_OVERLAY_IMAGE
    );

    this.animationLoader.getStaticImage(
      p5,
      TreeGlowSprite.TREE_EYES_BLINK
    );
    this.animationLoader.getStaticImage(
      p5,
      TreeGlowSprite.TREE_EYES_RIGHT
    );
    this.animationLoader.getStaticImage(
      p5,
      TreeGlowSprite.TREE_EYES_DOWN
    );
  }

  /**
   * Draw the glowy fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    let overlay = this.animationLoader.getStaticImage(
      p5,
      TreeGlowSprite.GLOW_OVERLAY_IMAGE
    );

    p5.push();
    p5.translate(this.x, this.y);
    p5.scale(this.scale, this.scale);
    p5.tint(255, Math.round(255 * this.alpha));
    p5.blendMode(p5.ADD);
    p5.image(overlay, -25, -45);
    p5.blendMode(p5.BLEND);

    if (this.alpha > 0.5) {
      let eyesImage = this.getEyesInDirection(p5);
      p5.tint(
        255,
        Math.round(255 * 2 * (this.alpha - 0.5))
      );
      p5.image(eyesImage, 0, 0);
    }

    p5.pop();
  }

  getEyesInDirection(p5) {
    let imagePath = TreeGlowSprite.TREE_EYES_RIGHT;
    if (
      this.eyeDirection === TreeGlowSprite.EyePosition.Down
    ) {
      imagePath = TreeGlowSprite.TREE_EYES_DOWN;
    } else if (
      this.eyeDirection === TreeGlowSprite.EyePosition.Blink
    ) {
      imagePath = TreeGlowSprite.TREE_EYES_BLINK;
    }
    return this.animationLoader.getStaticImage(
      p5,
      imagePath
    );
  }

  startGlowTransition() {
    if (!this.isTransitioning()) {
      if (this.isVisible) {
        this.startDisappear();
      } else {
        this.startReappear();
      }
    }
  }

  startDisappear() {
    this.animationFrame = 1;
    this.isDisappearing = true;
  }

  startReappear() {
    this.animationFrame = 1;
    this.delayFramesBeforeAppear = 48;
    this.isReappearing = true;
  }

  isTransitioning() {
    return this.isDisappearing || this.isReappearing;
  }

  isFrameBetween(min, max) {
    return (
      this.animationFrame >= min &&
      this.animationFrame < max
    );
  }

  startWatchingBird() {
    this.isWatchingBird = true;
  }

  stopWatchingBird() {
    this.isWatchingBird = false;
  }

  /**
   * Update the glow properties for each subsequent frame, depending
   * on if the glow is appearing or disappearing
   */
  update(p5) {
    this.animationFrame++;
    this.delayFramesBeforeAppear--;

    if (this.animationFrame > 120) {
      this.animationFrame = 1;
    }

    if (this.delayFramesBeforeAppear < 0) {
      this.delayFramesBeforeAppear = 0;
    }

    if (
      this.isTransitioning() ||
      this.delayFramesBeforeAppear > 0
    ) {
      this.eyeDirection = TreeGlowSprite.EyePosition.Blink;
    } else if (this.isFrameBetween(1, 10)) {
      this.eyeDirection = TreeGlowSprite.EyePosition.Blink;
    } else if (this.isWatchingBird) {
      this.eyeDirection = TreeGlowSprite.EyePosition.Right;
    } else if (this.isFrameBetween(30, 40)) {
      this.eyeDirection = TreeGlowSprite.EyePosition.Down;
    } else if (this.isFrameBetween(50, 110)) {
      this.eyeDirection = TreeGlowSprite.EyePosition.Right;
    } else {
      this.eyeDirection = TreeGlowSprite.EyePosition.Down;
    }

    if (this.delayFramesBeforeAppear < 36) {
      if (this.isDisappearing) {
        this.alpha -= this.alphaDecayRate;
        if (this.alpha < 0) {
          this.alpha = 0;
          this.isDisappearing = false;
          this.isVisible = false;
        }
      }

      if (this.isReappearing) {
        this.isDisappearing = false;
        this.alpha += this.alphaDecayRate;
        if (this.alpha > 1) {
          this.alpha = 1;
          this.isReappearing = false;
          this.isVisible = true;
        }
      }
    }
  }
}
