/**
 * Creates our monty sprite animation
 */

export default class FishySprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;
    this.x = x - (FishySprite.UNSCALED_IMAGE_WIDTH/2*scale);
    this.y = y;
    this.adjustX = 0;
    this.adjustY = 70;
    this.yVelocity = -4;
    this.yAcceleration = 0.12;

    this.xVelocity = 0;
    this.maxXVelocity = 2;
    this.xAcceleration = 0.12;

    this.hasFirstBounce = false;

    this.scale = scale;
    this.animationFrame = 1;

    this.isEmerging = false;
    this.isSwimmingAcrossLake = false;
    this.isDiving = false;
  }

  static UNSCALED_IMAGE_WIDTH = 400;
  static UNSCALED_IMAGE_HEIGHT = 282;

  static FISHY_IMAGE = "./assets/animation/fishy/fishy.png";


  /**
   * Preload all the images needed to draw the sprite
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(p5, FishySprite.FISHY_IMAGE);
  }

  /**
   * Draw the sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    let image = this.animationLoader.getStaticImage(p5, FishySprite.FISHY_IMAGE);

    p5.push();
    p5.translate(this.x + this.adjustX, this.y + this.adjustY);
    p5.scale(this.scale, this.scale);

    p5.image(image, 0, 0);
    p5.pop()
  }

  emergeFromWater() {
    this.isEmerging = true;
    this.animationFrame = 1;
  }

  isVisible() {
    return this.isEmerging || this.isDiving;
  }

  swimAcrossLake() {
    console.log("Swimming across lake!");
    this.isSwimmingAcrossLake = true;
  }

  dive() {
    this.isDiving = true;
    this.isEmerging = false;
  }

  getAdjustedX() {
    return this.x + this.adjustX;
  }

  getAdjustedY() {
    return this.y + this.adjustY;
  }

  /**
   * Update the fishy sprite properties for each subsequent frame,
   * to make him swim across the water in a sine-wave pattern.
   */
  update(p5, environment) {
    this.animationFrame++;

    //28 frames before we peak, then another 10,

    if (this.isEmerging) {
      this.adjustY += this.yVelocity;

      this.yVelocity += this.yAcceleration; //-4 (40 frames), before it starts going the other direction...

      if (!this.hasFirstBounce && this.yVelocity > 0) {
        //at peak, going back down now, switch to oscillating
        this.hasFirstBounce = true;
      }

      if (this.hasFirstBounce && this.adjustY > 3) { //below the line
        this.yVelocity = -0.5;
        this.yAcceleration = 0.05;
      }

      if (this.hasFirstBounce && this.adjustY < -3) { //above the line
        this.yVelocity = 0.5;
        this.yAcceleration = -0.05;
      }
    }

    if (this.isSwimmingAcrossLake) {

      this.adjustX -= this.xVelocity;

      if (this.xVelocity < this.maxXVelocity) {
        this.xVelocity += this.xAcceleration;
      }

      if (this.adjustX < -295) {
        this.xVelocity -= 0.2;
      }

      if (this.xVelocity < 0) {
        this.xVelocity = 0;
        this.isSwimmingAcrossLake = false;
      }
    }

    if (this.isDiving) {
      this.yVelocity += 0.12;
      this.adjustY += this.yVelocity;

      if (this.adjustY > 70) {
        this.isDiving = false;
      }
    }
  }
}
