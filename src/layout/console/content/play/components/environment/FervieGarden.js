/**
 * Creates our fervie garden behind the shroom house
 */
import Environment from "./Environment";
import Inventory from "../hud/Inventory";
import GameState from "../hud/GameState";

export default class FervieGarden extends Environment {
  static GROUND_IMAGE = "./assets/animation/garden/fervie_garden_background.png";
  static OVERLAY_IMAGE = "./assets/animation/garden/fervie_garden_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/garden/fervie_garden_walkarea.png";
  static ROPE_IMAGE = "./assets/animation/garden/fervie_garden_rope.png";

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

    this.movingRopeToInventory = false;
    this.isRopePresent = !this.globalHud.getGameStateProperty(GameState.Property.IS_ROPE_PICKED_UP);
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

    if (this.isRopePresent && this.isOverRopePosition(p5, p5.mouseX, p5.mouseY)) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
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

    if (footX / this.scaleAmountX > 725 && footY / this.scaleAmountY < 360) {
      return true;
    }
  }

  mousePressed(p5, fervie) {
    if (this.isRopePresent
      && !this.globalHud.hasActiveItemSelection()
      && this.isCloseToRope(fervie)
      && this.isOverRopePosition(p5, p5.mouseX, p5.mouseY)) {
      this.globalHud.setGameStateProperty(GameState.Property.IS_ROPE_PICKED_UP, true);
      this.isRopePresent = false;
      this.movingRopeToInventory = true;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
    if (this.movingRopeToInventory) {
      this.globalHud.addInventoryItem(Inventory.ItemType.ROPE);
      this.movingRopeToInventory = false;
    }
  }
}
