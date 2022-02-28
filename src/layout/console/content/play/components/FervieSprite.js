import AnimationId from "./AnimationId";

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
    this.animationFrame = 1;
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
   * Update the fervie sprite properties for each subsquent frame
   */
  update(p5) {
    if (p5.keyIsDown(p5.LEFT_ARROW)) {
      this.changeDirection(
        FervieSprite.Direction.Left,
        -6,
        0
      );
    } else if (p5.keyIsDown(p5.RIGHT_ARROW)) {
      this.changeDirection(
        FervieSprite.Direction.Right,
        6,
        0
      );
    } else if (p5.keyIsDown(p5.UP_ARROW)) {
      this.changeDirection(
        FervieSprite.Direction.Up,
        0,
        -2
      );
      this.scale -= 0.01;
    } else if (p5.keyIsDown(p5.DOWN_ARROW)) {
      this.changeDirection(
        FervieSprite.Direction.Down,
        0,
        2
      );
      this.scale += 0.01;
    } else {
      this.changeDirection(this.direction, 0, 0);
      //skip animation frame update so we can tell when we're stopped
      return;
    }

    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
  }

  changeDirection(direction, xChange, yChange) {
    if (direction === this.direction) {
      this.velocityX = Math.round(xChange * this.scale);
      this.velocityY = yChange;
      this.x += this.velocityX;
      this.y += yChange;
    } else {
      this.velocityX = 0;
      this.velocityY = 0;
    }
    this.direction = direction;
  }
}
