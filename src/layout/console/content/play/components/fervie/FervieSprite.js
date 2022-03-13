import AnimationId from "../AnimationId";

/**
 * Creates our fervie sprite animation
 */

export default class FervieSprite {
  constructor(animationLoader, x, y, size, direction) {
    this.animationLoader = animationLoader;
    this.x = x - size / 2 - 10;
    this.y = y - 20;
    this.size = size;
    this.direction = direction;
    this.velocityX = 0;
    this.velocityY = 0;
    this.scale = 1;
    this.animationFrame = 8;
    this.imageHeight = 0;

    this.downTheHill = false;
    this.upTheHill = false;

    this.yDownTheHill = 0;

    this.originalX = this.x;
    this.originalY = this.y;
    this.originalScale = this.scale;
  }

  /**
   * static enum subclass to store animation types
   * @returns {{Up: string, Down: string, Right: string, Left: string}}
   * @constructor
   */
  static get Direction() {
    return {
      Up: "Up",
      Down: "Down",
      Right: "Right",
      Left: "Left",
    };
  }

  static UNSCALED_IMAGE_WIDTH = 543;
  static UNSCALED_IMAGE_HEIGHT = 443;

  /**
   * Preload all the walk images by processing the svgs with the colors then flattening to images
   * @param p5
   */
  preload(p5) {
    for (let i = 1; i <= 24; i++) {
      this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkUp,
        i,
        this.size
      );

    }

    for (let i = 1; i <= 24; i++) {
      this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkRight,
        i,
        this.size
      );
    }

    for (let i = 1; i <= 24; i++) {
      this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkDown,
        i,
        this.size
      );
    }

  }

  /**
   * Draw the fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {

    let image = null;
    if (this.direction === FervieSprite.Direction.Up) {
      image = this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkUp,
        this.animationFrame,
        this.size
      );
      this.scaleAndDrawSprite(p5, image);
    } else if (
      this.direction === FervieSprite.Direction.Down
    ) {
      image = this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkDown,
        this.animationFrame,
        this.size
      );
      this.scaleAndDrawSprite(p5, image);
    } else if (
      this.direction === FervieSprite.Direction.Right
    ) {
      image = this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkRight,
        this.animationFrame,
        this.size
      );
      this.scaleAndDrawSprite(p5, image);
    } else if (
      this.direction === FervieSprite.Direction.Left
    ) {
      image = this.animationLoader.getAnimationImage(
        p5,
        AnimationId.Animation.FervieWalkRight,
        this.animationFrame,
        this.size
      );
      this.scaleAndMirrorAndDrawSprite(p5, image);
    }
  }

  /**
   * Shrink or grow fervie based on him being near/far
   * Mirror image for walking left (mirror of right)
   * @param p5
   * @param image
   */
  scaleAndMirrorAndDrawSprite(p5, image) {
    p5.push();
    p5.translate(
      this.x +
        Math.round(this.size * this.scale) +
        Math.round((this.size / 2) * (1 - this.scale)),
      this.y
    );
    p5.scale(this.scale, this.scale);
    p5.scale(-1, 1);
    p5.image(image, 0, 0);
    p5.pop();
  }

  /**
   * Scale fervie for near/far without any mirroring
   * @param p5
   * @param image
   */
  scaleAndDrawSprite(p5, image) {
    p5.push();
    p5.translate(
      this.x +
        Math.round((this.size / 2) * (1 - this.scale)),
      this.y
    );
    p5.scale(this.scale, this.scale);
    p5.image(image, 0, 0);
    p5.pop();
  }
  /**
   * Update the fervie sprite properties for each subsequent frame,
   * changing the direction of fervie based on the arrow keys
   */
  update(p5, environment) {
    if (p5.keyIsDown(p5.LEFT_ARROW)) {
      this.changeDirection(p5, environment,
        FervieSprite.Direction.Left,
        -6,
        0,
        0
      );
    } else if (p5.keyIsDown(p5.RIGHT_ARROW)) {
      this.changeDirection(p5, environment,
        FervieSprite.Direction.Right,
        6,
        0,
        0
      );
    } else if (p5.keyIsDown(p5.UP_ARROW)) {
      this.changeDirection(p5, environment,
        FervieSprite.Direction.Up,
        0,
        -2,
        -0.01
      );
    } else if (p5.keyIsDown(p5.DOWN_ARROW)) {
      this.changeDirection(p5, environment,
        FervieSprite.Direction.Down,
        0,
        2,
        0.01

      );
    } else {
      this.changeDirection(p5, environment, this.direction, 0, 0, 0);
      //skip animation frame update so we can tell when we're stopped
      return;
    }

    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
  }

  getDirection() {
    return this.direction;
  }

  /**
   * Change our fervies direction.  Take into account if we are walking down a hill
   * And if our position is valid on the environment walk map.
   * @param p5
   * @param environment
   * @param direction
   * @param xChange
   * @param yChange
   * @param scaleChange
   */
  changeDirection(p5, environment, direction, xChange, yChange, scaleChange) {
    if (direction === this.direction) { //if direction is the same as it was the last frame
      let newVelocityX = Math.round(xChange * this.scale);
      let newVelocityY = yChange;
      let newX = this.x + this.velocityX;
      let newY = this.y + this.velocityY;
      let newScale = this.scale + scaleChange;

      if (this.downTheHill && (direction === FervieSprite.Direction.Up)) {
        newVelocityY = -1 *yChange;
        this.yDownTheHill += newVelocityY;
      }

      if (this.upTheHill && direction === FervieSprite.Direction.Down) {
        newVelocityY = -1 *yChange;
        this.yDownTheHill += newVelocityY;

        if (this.yDownTheHill <= 0) {
          this.yDownTheHill = 0;
          this.upTheHill = false;
        }
      }

      if ((this.downTheHill || this.upTheHill) &&
        (direction === FervieSprite.Direction.Left || direction === FervieSprite.Direction.Right)) {
        //dont allow left or right movements while we're down the hill
        newX = this.x;
        newVelocityX = this.velocityX;
      }

      let footPosition = this.getFervieFootPosition(newX, newY, newScale);

      if (environment.isValidPosition(p5, footPosition[0], footPosition[1])) {
        p5.fill('red');
        this.x = newX;
        this.y = newY;
        this.scale = newScale;
      } else {
        p5.fill('blue');
      }
      this.velocityX = newVelocityX;
      this.velocityY = newVelocityY;

    } else {
      this.velocityX = 0;
      this.velocityY = 0;
    }
    this.direction = direction;
  }

  triggerUpTheHill() {
    this.upTheHill = true;
    this.downTheHill = false;
  }

  triggerDownTheHill() {
    this.downTheHill = true;
    this.upTheHill = false;
  }

  isBehindTheHill() {
    return this.yDownTheHill > 0;
  }

  getDistanceDownTheHill() {
    return this.yDownTheHill;
  }

  resetDownTheHill() {
    this.downTheHill = false;
    this.upTheHill = false;
    this.yDownTheHill = 0;
  }

  getFervieFootX() {
    return Math.round(this.x + this.size/2 * this.scale)
      + Math.round((this.size / 2) * (1 - this.scale));
  }

  getFervieFootY() {
    let imageScale = this.size / FervieSprite.UNSCALED_IMAGE_WIDTH;
    let adjustedHeight = FervieSprite.UNSCALED_IMAGE_HEIGHT * imageScale;

    return Math.round(this.y + adjustedHeight * 0.9 * this.scale);
  }

  getFervieFootPosition(x, y, scale) {
    let footX = Math.round(x + this.size/2 * scale)
    + Math.round((this.size / 2) * (1 - scale));

    let imageScale = this.size / FervieSprite.UNSCALED_IMAGE_WIDTH;
    let adjustedHeight = FervieSprite.UNSCALED_IMAGE_HEIGHT * imageScale;

    let footY = Math.round(y + adjustedHeight * 0.9 * scale);

    return [footX, footY];
  }

  moveToPoint(x, y) {
    //whatever size he is now, we need to adjust the scale of where he would be in the new location

    let newScale = this.originalScale + (y - 20 - this.originalY) / 2 * 0.01;

    let newX = x - this.size / 2 * newScale - 10;  //difference I want to move in a negative x
    let newY = y - 20;

    this.x = newX;
    this.y = newY;
    this.scale = newScale;
  }

}
