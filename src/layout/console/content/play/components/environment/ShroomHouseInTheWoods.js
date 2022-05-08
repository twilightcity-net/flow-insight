/**
 * Creates our mushroom house in the woods environment for Fervie to walk around in
 */
import AnimationId from "../AnimationId";
import Environment from "./Environment";
import FervieSprite from "../fervie/FervieSprite";
import GlowSprite from "../fervie/GlowSprite";

export default class ShroomHouseInTheWoods extends Environment {
  static GROUND_IMAGE =
    "./assets/animation/shroomhouse/fervie_home_ground.png";
  static OVERLAY_IMAGE =
    "./assets/animation/shroomhouse/fervie_home_overlay.png";
  static SKY_IMAGE =
    "./assets/animation/shroomhouse/fervie_home_sky.png";
  static WALK_AREA_IMAGE =
    "./assets/animation/shroomhouse/fervie_home_walk_area.png";
  static WALK_BEHIND_AREA_IMAGE =
    "./assets/animation/shroomhouse/fervie_home_walk_area_behind.png";

  static SHROOM_DOOR =
    "./assets/animation/shroomhouse/shroom_door.png";
  static SHROOM_DOOR_MASK =
    "./assets/animation/shroomhouse/shroom_door_mask.png";

  static MAX_DOOR_POSITION = -140;

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SKY_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.OVERLAY_IMAGE);

    this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_BEHIND_AREA_IMAGE);

    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR_MASK);

    this.glowSprite = new GlowSprite(this.animationLoader,
      ((Environment.IMAGE_WIDTH - 347) * this.scaleAmountX), ((Environment.IMAGE_HEIGHT - 157) * this.scaleAmountY), 0.6);
    this.glowSprite.preload(p5);

    this.doorPosition = 0;
    this.isDoorTransitioning = false;
    this.doorSpeed = 2;
    this.isDoorOpen = false;

    this.isGoingThroughDoor = false;
  }

  getDefaultSpawnProperties() {
    return this.getLeftSpawnProperties();
  }

  getLeftSpawnProperties() {
    return {
      x: Math.round(40 * this.scaleAmountX),
      y: Math.round(170 * this.scaleAmountY),
    };
  }

  getRightSpawnProperties() {
    return {
      x: Math.round((Environment.IMAGE_WIDTH - 100) * this.scaleAmountX),
      y: Math.round(200 * this.scaleAmountY),
    };
  }

  getSouthSpawnProperties() {
    return {
      x: Math.round(this.width / 2),
      y: Math.round(170 * this.scaleAmountY),
    };
  }

  getNorthSpawnProperties() {
    return {
      x: Math.round(895 * this.scaleAmountX),
      y: Math.round(280 * this.scaleAmountY),
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      ShroomHouseInTheWoods.WALK_AREA_IMAGE
    );

    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      ShroomHouseInTheWoods.WALK_BEHIND_AREA_IMAGE
    );

    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isOverDoorPosition(p5, x, y) {
    let doorMask = this.animationLoader.getStaticImage(
      p5,
      ShroomHouseInTheWoods.SHROOM_DOOR_MASK
    );

    let color = doorMask.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    if (color && color[3] > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let skyImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SKY_IMAGE);
    let groundImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.GROUND_IMAGE);
    let houseImage = this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);
    let shroomDoor = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR);
    let shroomDoorMask = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR_MASK);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(skyImage, 0, 0);
    p5.image(groundImage, 0, 0);

    if (
      !this.isWalkBehindPosition(
        p5,
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      p5.image(shroomDoorMask, 0, 0);
      p5.image(shroomDoor, 0, this.doorPosition);
      p5.image(houseImage, 0, 0);
    }

    this.glowSprite.draw(p5);

    if (this.isOverDoorPosition(p5, p5.mouseX, p5.mouseY)) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.OVERLAY_IMAGE);
    let houseImage = this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);
    let shroomDoor = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR);
    let shroomDoorMask = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SHROOM_DOOR_MASK);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (
      this.isWalkBehindPosition(
        p5,
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      p5.image(shroomDoorMask, 0, 0);
      p5.image(shroomDoor, 0, this.doorPosition);
      p5.image(houseImage, 0, 0);
    }
    p5.image(overlayImage, 0, 0);


    p5.pop();
  }

  mousePressed(p5, fervie) {
    console.log(fervie.y);

    if (this.isOverDoorPosition(p5, p5.mouseX, p5.mouseY)
      && !this.globalHud.hasActiveItemSelection()) {
      if (this.isDoorTransitioning) {
        this.isDoorOpen = !this.isDoorOpen;
      } else {
        this.isDoorTransitioning = true;
        this.glowSprite.startReappear();
        fervie.startGlowChanneling();
      }
    }
  }

  isFervieInFrontOfDoor(fervie) {
    //between two points, 843 <=> 907 on x, 405 <=> 407 on y position

    let x = Math.round(
      fervie.getFervieFootX() / this.scaleAmountX
    );
    let y = Math.round(
      fervie.getFervieFootY() / this.scaleAmountY
    );

    if (
      fervie.getDirection() === FervieSprite.Direction.Up &&
      x > 843 &&
      x < 907 &&
      y <= 407 &&
      y > 390
    ) {
      return true;
    }
    return false;
  }

  hasFervieMovingNorth(fervie) {
    return this.isGoingThroughDoor;
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
    this.glowSprite.update(p5);

    if (
      this.isDoorOpen &&
      !this.isDoorTransitioning &&
      this.isFervieInFrontOfDoor(fervie)
    ) {
      this.isGoingThroughDoor = true;
    } else {
      this.isGoingThroughDoor = false;
    }

    if (this.isDoorTransitioning) {
      if (this.isDoorOpen) {
        //closing door
        this.doorPosition += this.doorSpeed;

        if (this.doorPosition > 0) {
          this.doorPosition = 0;
          this.isDoorTransitioning = false;
          this.glowSprite.startDisappear();
          fervie.stopGlowChanneling();
          this.isDoorOpen = false;
        }
      } else {
        //opening door

        this.doorPosition -= this.doorSpeed;
        if (
          this.doorPosition <
          ShroomHouseInTheWoods.MAX_DOOR_POSITION
        ) {
          this.doorPosition =
            ShroomHouseInTheWoods.MAX_DOOR_POSITION;
          this.glowSprite.startDisappear();
          fervie.stopGlowChanneling();
          this.isDoorTransitioning = false;
          this.isDoorOpen = true;
        }
      }
    } else {
      this.glowSprite.startDisappearIfVisible();
    }
  }
}
