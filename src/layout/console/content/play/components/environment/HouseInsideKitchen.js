/**
 * Creates our inside house map, the kitchen inside the house
 */
import Environment from "./Environment";
import Inventory from "../hud/Inventory";

export default class HouseInsideKitchen extends Environment {
  static BACKGROUND_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_background.png";
  static TOWEL_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_towel.png";
  static OVERLAY_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_walkarea_behind.png";
  static WALK_BEHIND_WALL = "./assets/animation/insidehouse/house_inside_kitchen_behindwall.png";

  constructor(animationLoader, width, height, globalHud) {
    super(animationLoader, width, height, globalHud);

    this.isTowelPresent = true;
    this.movingTowelToInventory = false;
  }

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.BACKGROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.TOWEL_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_WALL);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.OVERLAY_IMAGE);

    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_AREA_IMAGE);
  }

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getRightSpawnProperties() {
    return {
      x: Math.round(
        (HouseInsideKitchen.IMAGE_WIDTH - 150) *
        this.scaleAmountX
      ),
      y: Math.round(
        (HouseInsideKitchen.IMAGE_HEIGHT / 2) *
        this.scaleAmountY
      ),
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_AREA_IMAGE
    );

    let color = walkAreaImage.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    if (color && color[0] > 0) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_BEHIND_AREA_IMAGE
    );

    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.BACKGROUND_IMAGE);
    let towelImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.TOWEL_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if (this.isTowelPresent) {
      p5.image(towelImage, 0, 0);
    }

    if (this.isTowelPresent && this.isOverTowelPosition(p5, p5.mouseX, p5.mouseY)) {
      this.globalHud.setIsActionableHover(true);
    } else {
      this.globalHud.setIsActionableHover(false);
    }

    p5.pop();
  }

  /**
   * Returns true if the x,y position is over the dish towel by the sink
   * @param p5
   * @param x
   * @param y
   * @returns {boolean}
   */
  isOverTowelPosition(p5, x, y) {
    let towelImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.TOWEL_IMAGE);

    let adjustedX = Math.round(x / this.scaleAmountX);
    let adjustedY = Math.round(y / this.scaleAmountY);
    let color = towelImage.get(adjustedX, adjustedY)

    return !!(color && color[3] > 0 && adjustedX > 650);
  }

  isCloseToTowel(fervie) {
    let footX = fervie.getFervieFootX();

    if (footX < 700) {
      return true;
    }
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.OVERLAY_IMAGE);
    let wall = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_WALL);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(wall, 0, 0);
    }
    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  mousePressed(p5, fervie) {

    if (this.isTowelPresent
      && this.isCloseToTowel(fervie)
      && this.isOverTowelPosition(p5, p5.mouseX, p5.mouseY)) {
      this.isTowelPresent = false;
      this.movingTowelToInventory = true;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    if (this.movingTowelToInventory) {
      this.globalHud.addInventoryItem(Inventory.ItemType.TOWEL);
      this.movingTowelToInventory = false;
    }
  }
}
