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
    this.adjustXTarget = 0;

    this.cumulativeAdjustY = 0;
    this.adjustY = 0;
    this.adjustYTarget = 0;

    this.walkSpeed = 4;
    this.walkUpSpeed = 2;

    this.walkDirection = LadyWalkSprite.WalkDirection.Left;
  }

  static get WalkDirection() {
    return {
      Left: "Left",
      Right: "Right",
      Up: "Up"
    };
  }

  static UNSCALED_IMAGE_WIDTH = 291;
  static UNSCALED_IMAGE_HEIGHT = 330;

  static WALK_RIGHT_1 = "./assets/animation/fervie/walk/fervie_lady_walks_right1.png";
  static WALK_RIGHT_2 = "./assets/animation/fervie/walk/fervie_lady_walks_right2.png";
  static WALK_RIGHT_3 = "./assets/animation/fervie/walk/fervie_lady_walks_right3.png";
  static WALK_RIGHT_4 = "./assets/animation/fervie/walk/fervie_lady_walks_right4.png";
  static WALK_RIGHT_5 = "./assets/animation/fervie/walk/fervie_lady_walks_right5.png";
  static WALK_RIGHT_6 = "./assets/animation/fervie/walk/fervie_lady_walks_right6.png";
  static WALK_RIGHT_7 = "./assets/animation/fervie/walk/fervie_lady_walks_right7.png";
  static WALK_RIGHT_8 = "./assets/animation/fervie/walk/fervie_lady_walks_right8.png";
  static WALK_RIGHT_9 = "./assets/animation/fervie/walk/fervie_lady_walks_right9.png";
  static WALK_RIGHT_10 = "./assets/animation/fervie/walk/fervie_lady_walks_right10.png";
  static WALK_RIGHT_11 = "./assets/animation/fervie/walk/fervie_lady_walks_right11.png";
  static WALK_RIGHT_12 = "./assets/animation/fervie/walk/fervie_lady_walks_right12.png";

  static WALK_UP_1 = "./assets/animation/fervie/walk/fervie_lady_walks_up1.png";
  static WALK_UP_2 = "./assets/animation/fervie/walk/fervie_lady_walks_up2.png";
  static WALK_UP_3 = "./assets/animation/fervie/walk/fervie_lady_walks_up3.png";
  static WALK_UP_4 = "./assets/animation/fervie/walk/fervie_lady_walks_up4.png";
  static WALK_UP_5 = "./assets/animation/fervie/walk/fervie_lady_walks_up5.png";
  static WALK_UP_6 = "./assets/animation/fervie/walk/fervie_lady_walks_up6.png";
  static WALK_UP_7 = "./assets/animation/fervie/walk/fervie_lady_walks_up7.png";
  static WALK_UP_8 = "./assets/animation/fervie/walk/fervie_lady_walks_up8.png";
  static WALK_UP_9 = "./assets/animation/fervie/walk/fervie_lady_walks_up9.png";
  static WALK_UP_10 = "./assets/animation/fervie/walk/fervie_lady_walks_up10.png";
  static WALK_UP_11 = "./assets/animation/fervie/walk/fervie_lady_walks_up11.png";
  static WALK_UP_12 = "./assets/animation/fervie/walk/fervie_lady_walks_up12.png";


  /**
   * Preload all the fervie walk images
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_1);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_2);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_3);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_4);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_5);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_6);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_7);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_8);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_9);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_10);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_11);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_12);

    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_1);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_2);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_3);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_4);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_5);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_6);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_7);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_8);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_9);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_10);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_11);
    this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_12);
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
    } else if (this.walkDirection === LadyWalkSprite.WalkDirection.Up) {
      let image = this.getWalkUpImageForFrame(p5, this.animationFrame);
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
    p5.translate(this.getCurrentX(), this.getCurrentY() - 40);
    p5.scale(this.scale, this.scale);

    if (this.walkDirection === LadyWalkSprite.WalkDirection.Up) {
      p5.scale(0.85, 0.85); //these images are a bit bigger
    }

    p5.image(image, 0, 0);
    p5.pop();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.cumulativeAdjustX = 0;
    this.cumulativeAdjustY = 0;
    this.adjustX = 0;
    this.adjustY = 0;
    this.adjustYTarget = 0;
    this.adjustXTarget = 0;
  }

  getCurrentX() {
    return this.x + this.cumulativeAdjustX + this.adjustX;
  }

  getCurrentY() {
    return this.y + this.cumulativeAdjustY + this.adjustY;
  }

  getWalkRightImageForFrame(p5, frameIn24) {
    let frameIn12 = AnimationId.getFrameOnTwos(frameIn24);
    switch (frameIn12) {
      case 1:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_1);
      case 2:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_2);
      case 3:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_3);
      case 4:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_4);
      case 5:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_5);
      case 6:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_6);
      case 7:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_7);
      case 8:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_8);
      case 9:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_9);
      case 10:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_10);
      case 11:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_11);
      case 12:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_RIGHT_12);
    }
    return null;
  }


  getWalkUpImageForFrame(p5, frameIn24) {
    let frameIn12 = AnimationId.getFrameOnTwos(frameIn24);
    switch (frameIn12) {
      case 1:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_1);
      case 2:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_2);
      case 3:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_3);
      case 4:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_4);
      case 5:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_5);
      case 6:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_6);
      case 7:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_7);
      case 8:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_8);
      case 9:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_9);
      case 10:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_10);
      case 11:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_11);
      case 12:
        return this.animationLoader.getStaticImage(p5, LadyWalkSprite.WALK_UP_12);
    }
    return null;
  }

  walkLeft(amount, callback) {
    console.log("walk left");
    this.whenDoneCallback = callback;
    this.adjustXTarget = -1 * amount;
    this.walkDirection = LadyWalkSprite.WalkDirection.Left;
  }

  walkRight(amount, callback) {
    this.whenDoneCallback = callback;
    this.adjustXTarget = amount;
    this.walkDirection = LadyWalkSprite.WalkDirection.Right;
  }

  walkUp(amount, callback) {
    this.whenDoneCallback = callback;
    this.adjustYTarget = -1 * amount;
    this.walkDirection = LadyWalkSprite.WalkDirection.Up;
  }

  runDoneCallback() {
    if (this.whenDoneCallback) {
      let callback = this.whenDoneCallback;
      this.whenDoneCallback = null;
      callback();
    }
  }

  /**
   * Update the fervie animation properties for each subsequent frame
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
    if (this.walkDirection === LadyWalkSprite.WalkDirection.Left && this.adjustX > this.adjustXTarget) {
      this.adjustX -= this.walkSpeed;
      if (this.adjustX <= this.adjustXTarget) {
        this.cumulativeAdjustX += this.adjustXTarget;
        this.adjustX = 0;
        this.adjustXTarget = 0;
        this.runDoneCallback();
      }
    } else if (this.walkDirection === LadyWalkSprite.WalkDirection.Right && this.adjustX < this.adjustXTarget) {
      this.adjustX += this.walkSpeed;
      if (this.adjustX >= this.adjustXTarget) {
        this.cumulativeAdjustX += this.adjustXTarget;
        this.adjustX = 0;
        this.adjustXTarget = 0;
        this.runDoneCallback();
      }
    } else if (this.walkDirection === LadyWalkSprite.WalkDirection.Up && this.adjustY > this.adjustYTarget) {
      this.adjustY -= this.walkUpSpeed;
      if (this.adjustY <= this.adjustYTarget) {
        this.cumulativeAdjustY += this.adjustYTarget;
        this.adjustY = 0;
        this.adjustYTarget = 0;
        this.runDoneCallback();
      }
    }
  }
}
