import AnimationId from "../AnimationId";

/**
 * Creates our lady walking around sprite animation
 */

export default class LadyWalkSprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;

    this.animationFrame = 1;
    this.x = x;
    this.y = y;
    this.scale = scale;

    this.cumulativeAdjustX = 0;
    this.adjustX = 0;
    this.adjustTarget = 0;
    this.walkSpeed = 4;

    this.walkDirection = LadyWalkSprite.WalkDirection.Left;
  }

  static get WalkDirection() {
    return {
      Left: "Left",
      Right: "Right"
    };
  }

  static UNSCALED_IMAGE_WIDTH = 291;
  static UNSCALED_IMAGE_HEIGHT = 330;

  static WALK1 = "./assets/animation/fervie/walk/fervie_lady_walks_right1.png";
  static WALK2 = "./assets/animation/fervie/walk/fervie_lady_walks_right2.png";
  static WALK3 = "./assets/animation/fervie/walk/fervie_lady_walks_right3.png";
  static WALK4 = "./assets/animation/fervie/walk/fervie_lady_walks_right4.png";
  static WALK5 = "./assets/animation/fervie/walk/fervie_lady_walks_right5.png";
  static WALK6 = "./assets/animation/fervie/walk/fervie_lady_walks_right6.png";
  static WALK7 = "./assets/animation/fervie/walk/fervie_lady_walks_right7.png";
  static WALK8 = "./assets/animation/fervie/walk/fervie_lady_walks_right8.png";
  static WALK9 = "./assets/animation/fervie/walk/fervie_lady_walks_right9.png";
  static WALK10 = "./assets/animation/fervie/walk/fervie_lady_walks_right10.png";
  static WALK11 = "./assets/animation/fervie/walk/fervie_lady_walks_right11.png";
  static WALK12 = "./assets/animation/fervie/walk/fervie_lady_walks_right12.png";


  /**
   * Preload all the fervie walk images
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK1);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK2);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK3);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK4);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK5);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK6);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK7);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK8);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK9);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK10);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK11);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK12);
  }

  /**
   * Draw the walking fervie lady sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    if (this.walkDirection === LadyWalkSprite.WalkDirection.Left) {
      let image = this.getWalkRightImageForFrame(p5, this.animationFrame);
      this.scaleAndMirrorAndDrawSprite(p5, image);
    } else if (this.walkDirection === LadyWalkSprite.WalkDirection.Right) {
      let image = this.getWalkRightImageForFrame(p5, this.animationFrame);
      this.scaleAndDrawSprite(p5, image);
    }
  }

  /**
   * Mirror image for walking left (mirror of right)
   * @param p5
   * @param image
   */
  scaleAndMirrorAndDrawSprite(p5, image) {
    p5.push();
    p5.translate( this.getCurrentX() + Math.round(LadyWalkSprite.UNSCALED_IMAGE_WIDTH * this.scale) - 10, this.y - 40);
    p5.scale(this.scale, this.scale);
    p5.scale(-1, 1);
    p5.image(image, 0, 0);
    p5.pop();
  }

  /**
   * Draw scaled image
   * @param p5``
   * @param image
   */
  scaleAndDrawSprite(p5, image) {
    p5.push();
    p5.translate(this.getCurrentX(), this.y - 40);
    p5.scale(this.scale, this.scale);
    p5.image(image, 0, 0);
    p5.pop();
  }


  getCurrentX() {
    return this.x + this.cumulativeAdjustX + this.adjustX;
  }

  getCurrentY() {
    return this.y;
  }

  getWalkRightImageForFrame(p5, frameIn24) {
    let frameIn12 = AnimationId.getFrameOnTwos(frameIn24);
    switch (frameIn12) {
      case 1:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK1);
      case 2:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK2);
      case 3:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK3);
      case 4:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK4);
      case 5:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK5);
      case 6:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK6);
      case 7:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK7);
      case 8:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK8);
      case 9:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK9);
      case 10:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK10);
      case 11:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK11);
      case 12:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK12);
    }
    return null;
  }

  walkLeft(amount, callback) {
    this.walkDirection = LadyWalkSprite.WalkDirection.Left;
    this.adjustTarget = -1 * amount;

    console.log("adjust target = "+this.adjustTarget);
    this.whenDoneCallback = callback;
  }

  walkRight(amount, callback) {
    this.walkDirection = LadyWalkSprite.WalkDirection.Right;
    this.adjustTarget = amount;
    this.whenDoneCallback = callback;
  }

  /**
   * Update the fervie animation properties for each subsequent frame
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
    if (this.walkDirection === LadyWalkSprite.WalkDirection.Left && this.adjustX > this.adjustTarget) {
      this.adjustX -= this.walkSpeed;
      if (this.adjustX <= this.adjustTarget) {
        this.cumulativeAdjustX += this.adjustTarget;
        this.adjustX = 0;
        this.adjustTarget = 0;
        if (this.whenDoneCallback) {
          this.whenDoneCallback();
          this.whenDoneCallback = null;
        }
      }
    } else if (this.walkDirection === LadyWalkSprite.WalkDirection.Right && this.adjustX < this.adjustTarget) {
      this.adjustX += this.walkSpeed;
      if (this.adjustX >= this.adjustTarget) {
        this.cumulativeAdjustX += this.adjustTarget;
        this.adjustX = 0;
        this.adjustTarget = 0;
        if (this.whenDoneCallback) {
          this.whenDoneCallback();
          this.whenDoneCallback = null;
        }
      }
    }
  }
}
