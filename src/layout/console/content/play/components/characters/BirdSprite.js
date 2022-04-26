/**
 * Creates our fervie glow sprite animation
 */

export default class BirdSprite {
  constructor(animationLoader, x, y) {
    this.animationLoader = animationLoader;
    this.x = x;
    this.y = y;
    this.scale = 1;

    this.originalY = y;
    this.originalX = x;

    this.animationFrame = 1;

    this.birdActivity = BirdSprite.BirdActivity.Sit;
    this.birdFile = BirdSprite.BIRD_UPRIGHT;

    this.velocityY = 0;
    this.velocityX = 0;
    this.accelerationY = 0;
    this.accelerationMax = 0.7;

    this.gravityFall = 0.4;
    this.gravityFly = 0.1;

    this.delayBeforeStart = 1;

    this.isVisible = false;
  }

  static BIRD_FLY =
    "./assets/animation/bigtree/bird_fly.png";
  static BIRD_FLY_FLAP =
    "./assets/animation/bigtree/bird_fly_flap.png";
  static BIRD_PECK =
    "./assets/animation/bigtree/bird_peck.png";
  static BIRD_PECK_LOW =
    "./assets/animation/bigtree/bird_peck_low.png";
  static BIRD_UPRIGHT =
    "./assets/animation/bigtree/bird_upright.png";

  /**
   * static enum subclass to store animation types
   * @returns {{Sit: string, Fly: string, Peck: string}}
   * @constructor
   */
  static get BirdActivity() {
    return {
      Fly: "Fly",
      Peck: "Peck",
      Sit: "Sit",
    };
  }

  static UNSCALED_BIRD_WIDTH = 69;

  /**
   * Preload all the walk images by processing the svgs with the colors then flattening to images
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(
      p5,
      BirdSprite.BIRD_FLY
    );
    this.animationLoader.getStaticImage(
      p5,
      BirdSprite.BIRD_FLY_FLAP
    );
    this.animationLoader.getStaticImage(
      p5,
      BirdSprite.BIRD_PECK
    );
    this.animationLoader.getStaticImage(
      p5,
      BirdSprite.BIRD_PECK_LOW
    );
    this.animationLoader.getStaticImage(
      p5,
      BirdSprite.BIRD_UPRIGHT
    );

    this.isVisible = false;
  }

  /**
   * Draw the glowy fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    if (!this.isVisible) {
      return;
    }

    let birdImage = this.animationLoader.getStaticImage(
      p5,
      this.birdFile
    );

    p5.push();
    p5.translate(this.x, this.y);
    p5.scale(this.scale, this.scale);
    p5.image(birdImage, 0, 0);

    p5.pop();
  }

  startFlyDown() {
    this.isVisible = true;
    this.animationFrame = 1;
    this.birdActivity = BirdSprite.BirdActivity.Fly;

    this.x = this.originalX - 200;
    this.y = -45;
    this.accelerationY = -0.5;
    this.velocityX = 5;

    this.delayBeforeStart = 1;
  }

  startFlyAway() {
    this.animationFrame = 1;
    this.birdActivity = BirdSprite.BirdActivity.Fly;

    this.accelerationY = -1.7;
    this.velocityX = 5;

    setTimeout(() => {
      this.isVisible = false;
    }, 1000);
  }

  isFrameBetween(min, max) {
    return (
      this.animationFrame >= min &&
      this.animationFrame < max
    );
  }

  hop() {
    this.velocityY = 0;
    this.velocityX = 2;
    this.accelerationY = -1;
    this.birdActivity = BirdSprite.BirdActivity.Peck;
  }

  resetPosition() {
    this.x = this.originalX;
    this.y = this.originalY;
    this.velocityY = 0;
    this.velocityX = 0;
    this.accelerationY = 0;
  }

  isOscillation(cycleSize, frame) {
    let prevFrame = frame - 1;
    let cycle = Math.floor(frame / cycleSize);
    let prevCycle = Math.floor(prevFrame / cycleSize);

    let mod = cycle % 2;
    let prevMod = prevCycle % 2;

    return mod !== prevMod;
  }

  getCycle(cycleSize, frame) {
    let cycle = Math.floor(frame / cycleSize);
    let mod = cycle % 2;
    return mod;
  }

  isBirdOnScreen() {
    return this.isVisible && this.delayBeforeStart > 200;
  }
  /**
   * Update the glow properties for each subsequent frame, depending
   * on if the glow is appearing or disappearing
   */
  update(p5) {
    this.delayBeforeStart++;
    if (this.delayBeforeStart < 200) {
      return;
    }

    this.animationFrame++;

    if (this.animationFrame > 400) {
      this.animationFrame = 1;
    }

    this.updateBirdGravity(p5);

    if (this.isOscillation(380, this.animationFrame)) {
      this.startFlyAway();
    }

    if (this.birdActivity === BirdSprite.BirdActivity.Fly) {
      if (this.getCycle(5, this.animationFrame) === 0) {
        this.birdFile = BirdSprite.BIRD_FLY;
      } else {
        this.birdFile = BirdSprite.BIRD_FLY_FLAP;
      }
    } else if (
      this.birdActivity === BirdSprite.BirdActivity.Sit
    ) {
      this.birdFile = BirdSprite.BIRD_UPRIGHT;
      if (this.isOscillation(50, this.animationFrame)) {
        this.hop();
      }
    } else if (
      this.birdActivity === BirdSprite.BirdActivity.Peck
    ) {
      if (this.getCycle(10, this.animationFrame) === 0) {
        this.birdFile = BirdSprite.BIRD_PECK;
      } else {
        this.birdFile = BirdSprite.BIRD_PECK_LOW;
      }

      if (this.isOscillation(60, this.animationFrame)) {
        this.birdActivity = BirdSprite.BirdActivity.Sit;
      }

      if (this.isOscillation(50, this.animationFrame)) {
        this.hop();
      }
    }
  }

  updateBirdGravity(p5) {
    this.velocityY += this.accelerationY;
    this.y += this.velocityY;
    this.x += this.velocityX;

    //don't let the birdy go through the ground.
    if (this.y > this.originalY) {
      this.y = this.originalY;
      this.velocityY = 0;
      this.velocityX = 0;
      if (
        this.birdActivity === BirdSprite.BirdActivity.Fly
      ) {
        this.birdActivity = BirdSprite.BirdActivity.Sit;
      }
    }

    if (this.accelerationY < this.accelerationMax) {
      if (
        this.birdActivity === BirdSprite.BirdActivity.Fly
      ) {
        this.accelerationY += this.gravityFly;
      } else {
        this.accelerationY += this.gravityFall;
      }
    } else {
      this.accelerationY = this.accelerationMax;
    }
  }
}
