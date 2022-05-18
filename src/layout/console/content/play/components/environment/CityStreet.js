/**
 * Creates our scrolling city street environment where the background scrolls as fervie walks
 */
import Environment from "./Environment";
import AnimationId from "../AnimationId";
import MontySprite from "../characters/MontySprite";
import Fervie from "../fervie/FervieSprite";

export default class CityStreet extends Environment {
  static GROUND_IMAGE = "./assets/animation/city_street/city_street_background.png";
  static WALKAREA_IMAGE = "./assets/animation/city_street/city_street_walkarea.png";
  static THEATER_DOOR_MASK_IMAGE = "./assets/animation/city_street/theater_door_mask.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, CityStreet.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, CityStreet.WALKAREA_IMAGE);
    this.animationLoader.getStaticImage(p5, CityStreet.THEATER_DOOR_MASK_IMAGE);
    this.animationLoader.getScaledSvgImage(p5, AnimationId.Animation.CityStreetSigns, 5160, 960);

    this.cowSprite = new MontySprite(this.animationLoader, 300, this.height/2 + 60, 0.6)

    this.backgroundScroll = 1280;
    this.scrollRate = 4;

    this.isGoingInTheater = false;

    this.isTheaterDoorOpen = false;
  }

  static CITY_WIDTH = 2560;

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getNorthSpawnProperties() {
    console.log("getNorthSpawnProperties");
    this.backgroundScroll = 810; //TODO fix this to not be a side effect of the spawn position
    return {
      x: Math.round(620 * this.scaleAmountX),
      y: Math.round(345 * this.scaleAmountY),
      scale: 0.3,
    };
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

  isFervieGoingInTheater(fervie) {
    if (!this.isTheaterDoorOpen) {
      return false;
    }
    let adjustX = fervie.getFervieFootX() / this.scaleAmountX;
    let adjustY = fervie.getFervieFootY() / this.scaleAmountY;

    return fervie.getDirection() === Fervie.Direction.Up
      && adjustX > 635 && adjustX < 655 && adjustY < 410
      && this.backgroundScroll > 785 && this.backgroundScroll < 845;
  }

  isOverTheaterDoor(p5) {
    const adjustX = p5.mouseX / this.scaleAmountX + this.backgroundScroll;
    const adjustY = p5.mouseY / this.scaleAmountY;

      return (adjustX > 1425 && adjustX < 1492 && adjustY > 270 && adjustY < 380);
  }

  hasFervieMovingNorth(fervie) {
    return this.isGoingInTheater;
  }
  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, CityStreet.GROUND_IMAGE);
    let cityStreetSignImage = this.animationLoader.getScaledSvgImage(p5, AnimationId.Animation.CityStreetSigns, 5160, 960);

    console.log("city width = "+cityStreetSignImage.width);
    console.log("city height = "+cityStreetSignImage.height);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, -1 * this.backgroundScroll, 0);

    p5.push();
    p5.translate(-1 * this.backgroundScroll, 0);
    p5.scale(0.5, 0.5);
    p5.image(cityStreetSignImage, 0, 0);
    p5.pop();

    this.cowSprite.draw(p5);

    this.drawTheaterDoorMask(p5);

    if (this.isOverTheaterDoor(p5)) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    p5.pop();
  }

  drawTheaterDoorMask(p5) {

    if (this.isTheaterDoorOpen) {
      let theaterDoorImage = this.animationLoader.getStaticImage(p5, CityStreet.THEATER_DOOR_MASK_IMAGE);
      p5.image(theaterDoorImage, -1 * this.backgroundScroll + 1424, 277);
    }
  }

  drawOverlay(p5, fervie) {
    //nothing to do
  }

  mousePressed(p5, fervie) {
    console.log("backgroundScroll = "+this.backgroundScroll);

    if (this.isOverTheaterDoor(p5)) {
      this.isTheaterDoorOpen = !this.isTheaterDoorOpen;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
    this.cowSprite.update(p5, this);

    let x = fervie.getFervieFootX();
    let y = fervie.getFervieFootY();
    let xVelocity = fervie.getVelocityX();

    if (this.shouldScrollLeft(x, xVelocity, this.backgroundScroll)) {
      if (this.isValidPosition(p5, x + xVelocity, y)) {
        fervie.setVelocityX(0);
        this.backgroundScroll += this.scrollRate;

        if (this.backgroundScroll > 1280) {
          this.backgroundScroll = 1280;
        }
      }
    }

    if (this.shouldScrollRight(x, xVelocity, this.backgroundScroll)) {
      if (this.isValidPosition(p5, x + xVelocity, y)) {
        fervie.setVelocityX(0);
        this.backgroundScroll -= this.scrollRate;

        if (this.backgroundScroll < 0) {
          this.backgroundScroll = 0;
        }
      }
    }

    if (this.isFervieGoingInTheater(fervie)) {
      console.log("true!");
      this.isGoingInTheater = true;
    }

    this.cowSprite.adjustXBasedOnScroll(this.backgroundScroll);
  }
}
