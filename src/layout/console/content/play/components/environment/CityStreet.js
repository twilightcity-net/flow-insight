/**
 * Creates our scrolling city street environment where the background scrolls as fervie walks
 */
import Environment from "./Environment";
import AnimationId from "../AnimationId";
import MontySprite from "../characters/MontySprite";

export default class CityStreet extends Environment {
  static GROUND_IMAGE = "./assets/animation/city_street/city_street_background.png";
  static DOORS_IMAGE = "./assets/animation/city_street/city_street_door_fronts.png";
  static WALKAREA_IMAGE = "./assets/animation/city_street/city_street_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, CityStreet.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, CityStreet.DOORS_IMAGE);
    this.animationLoader.getStaticImage(p5, CityStreet.WALKAREA_IMAGE);
    this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.CityStreetSigns);

    this.cowSprite = new MontySprite(this.animationLoader, 300, this.height/2 + 60, 0.6)

    this.backgroundScroll = 1280;
    this.scrollRate = 4;
  }

  static CITY_WIDTH = 2560;

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getRightSpawnProperties() {
    console.log("getRightSpawnProperties");
    return {
      x: Math.round((CityStreet.IMAGE_WIDTH - 100) * this.scaleAmountX),
      y: Math.round((CityStreet.IMAGE_HEIGHT - 130) * this.scaleAmountY),
      scale: 0.3,
    };
  }

  getSouthSpawnProperties() {
    console.log("getSouthSpawnProperties");
    return {
      x: Math.round((CityStreet.IMAGE_WIDTH - 100) * this.scaleAmountX),
      y: Math.round((CityStreet.IMAGE_HEIGHT - 130) * this.scaleAmountY),
      scale: 0.3,
    };
  }

  getLeftSpawnProperties() {
    console.log("getLeftSpawnProperties");
    return {
      x: Math.round(100 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 140) * this.scaleAmountY),
      scale: 0.3
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, CityStreet.WALKAREA_IMAGE);

    return super.isWithinTargetArea(walkAreaImage, x + (this.backgroundScroll * this.scaleAmountX), y);
  }

  shouldScrollLeft(x, xVelocity, existingScroll) {
    return (x + xVelocity > this.width / 2 && xVelocity > 0 && existingScroll < 1280);
  }

  shouldScrollRight(x, xVelocity, existingScroll) {
    return (x + xVelocity < this.width / 2 && xVelocity < 0 && existingScroll > 0);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, CityStreet.GROUND_IMAGE);
    let doorsImage = this.animationLoader.getStaticImage(p5, CityStreet.DOORS_IMAGE);
    let cityStreetSignImage = this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.CityStreetSigns);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, -1 * this.backgroundScroll, 0);
    p5.image(doorsImage, -1 * this.backgroundScroll, 0);
    p5.image(cityStreetSignImage, -1 * this.backgroundScroll, 0);

    this.cowSprite.draw(p5);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    //nothing to do
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
    this.cowSprite.update(p5, this);

    let x = fervie.getFervieFootX();
    let y = fervie.getFervieFootY();
    let direction = fervie.getDirection();
    let xVelocity = fervie.getVelocityX();

    if (this.shouldScrollLeft(x, xVelocity, this.backgroundScroll)) {
      console.log("should scroll left!");

      if (this.isValidPosition(p5, x + xVelocity, y)) {
        fervie.setVelocityX(0);
        this.backgroundScroll += this.scrollRate;

        if (this.backgroundScroll > 1280) {
          this.backgroundScroll = 1280;
        }
      }
    }

    if (this.shouldScrollRight(x, xVelocity, this.backgroundScroll)) {
      console.log("should scroll right!");
      if (this.isValidPosition(p5, x + xVelocity, y)) {
        fervie.setVelocityX(0);
        this.backgroundScroll -= this.scrollRate;

        if (this.backgroundScroll < 0) {
          this.backgroundScroll = 0;
        }
      }
    }

    this.cowSprite.adjustXBasedOnScroll(this.backgroundScroll);

  }
}
