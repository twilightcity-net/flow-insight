/**
 * Creates our fervie garden behind the shroom house
 */
import Environment from "./Environment";
import Inventory from "../hud/Inventory";

export default class FervieGarden extends Environment {
  static GROUND_IMAGE = "./assets/animation/garden/fervie_garden_background.png";
  static OVERLAY_IMAGE = "./assets/animation/garden/fervie_garden_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/garden/fervie_garden_walkarea.png";
  static ROPE_IMAGE = "./assets/animation/garden/fervie_garden_rope.png";

  constructor(animationLoader, width, height) {
    super (animationLoader, width, height);

    this.isRopePresent = true;
    this.movingRopeToInventory = false;
  }

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, FervieGarden.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, FervieGarden.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, FervieGarden.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, FervieGarden.ROPE_IMAGE);
  }

  getDefaultSpawnProperties() {
    return this.getLeftSpawnProperties();
  }


  getLeftSpawnProperties() {
    console.log("getLeftSpawnProperties");
    return {
      x: Math.round(100 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 220) * this.scaleAmountY),
      scale: 0.7
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, FervieGarden.WALK_AREA_IMAGE);

    let isValid = super.isWithinTargetArea(walkAreaImage, x, y);

    let adjustX = Math.round(x / this.scaleAmountX);
    let adjustY = Math.round(y / this.scaleAmountY);

    if (isValid && this.isRopePresent) {
      if (adjustX > 870 && adjustY < 363) {
        isValid = false;
      }
    }
    return isValid;
  }

  /**
   * Returns true if the x,y position is over the rope on the ground
   * @param p5
   * @param x
   * @param y
   * @returns {boolean}
   */
  isOverRopePosition(p5, x, y) {
    let ropeImage = this.animationLoader.getStaticImage(p5, FervieGarden.ROPE_IMAGE);

    let color = ropeImage.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    return !!(color && color[3] > 0);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, FervieGarden.GROUND_IMAGE);


    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if (this.isRopePresent) {
      let ropeImage = this.animationLoader.getStaticImage(p5, FervieGarden.ROPE_IMAGE);
      p5.image(ropeImage, 0, 0);
    }

    p5.pop();

    if (this.isOverRopePosition(p5, p5.mouseX, p5.mouseY)) {
      p5.cursor(p5.HAND);
    } else {
      p5.cursor(p5.ARROW);
    }
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, FervieGarden.OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);
    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  isCloseToRope(fervie) {

    let footX = fervie.getFervieFootX();
    let footY = fervie.getFervieFootY();

    if (footX > 725 && footY < 360) {
      return true;
    }
  }

  mousePressed(p5, fervie) {
    if (this.isRopePresent
      && this.isCloseToRope(fervie)
      && this.isOverRopePosition(p5, p5.mouseX, p5.mouseY)) {
      this.isRopePresent = false;
      this.movingRopeToInventory = true;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie, globalHud) {
    super.update(p5);
    if (this.movingRopeToInventory) {
      globalHud.inventory.addItem(Inventory.ItemType.ROPE);
      this.movingRopeToInventory = false;
    }
  }
}
