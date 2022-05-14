/**
 * Creates our inside house map, the kitchen inside the house
 */
import Environment from "./Environment";
import Inventory from "../hud/Inventory";
import GameState from "../hud/GameState";
import LadyFervieSprite from "../characters/LadyFervieSprite";
import SmokeSprite from "../effects/SmokeSprite";

export default class HouseInsideKitchen extends Environment {
  static BACKGROUND_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_background.png";
  static TOWEL_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_towel.png";
  static PANS_ON_STOVE_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_stove.png";
  static PANS_PUT_AWAY_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_putaway.png";
  static OVERLAY_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_kitchen_walkarea_behind.png";
  static WALK_BEHIND_WALL = "./assets/animation/insidehouse/house_inside_kitchen_behindwall.png";

  constructor(animationLoader, width, height, globalHud) {
    super(animationLoader, width, height, globalHud);

    this.ladyFervieSprite = new LadyFervieSprite(this.animationLoader, 880, 300, 130, 0.50);
    this.smokeSprite = new SmokeSprite(this.animationLoader, 880, 230);
    this.teaSprite = new SmokeSprite(this.animationLoader, 820, 210);

  }

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.BACKGROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.TOWEL_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.PANS_ON_STOVE_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.PANS_PUT_AWAY_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_WALL);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.OVERLAY_IMAGE);

    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_AREA_IMAGE);

    this.isTowelPresent = !this.globalHud.getGameStateProperty(GameState.Property.IS_TOWEL_PICKED_UP);
    this.movingTowelToInventory = false;

    this.isSettledIn = this.globalHud.getGameStateProperty(GameState.Property.HAS_SETTLED_IN_HOUSE);
    this.homeActivity = this.globalHud.getGameStateProperty(GameState.Property.HOME_ACTIVITY);

    this.isLadyVisible = (this.isSettledIn && this.homeActivity === GameState.HomeActivity.COOKING);

    if (this.isLadyVisible) {
      this.ladyFervieSprite.preload(p5);
      this.smokeSprite.preload(p5);
      this.teaSprite.preload(p5);
      this.teaSprite.setParticleColor(255);
      this.teaSprite.setParticleSize(8);
      this.ladyFervieSprite.setVisible(true);
      this.playCookingAnimation();
    } else {
      this.ladyFervieSprite.setVisible(false);
    }

  }

  playCookingAnimation() {
    this.smokeSprite.start();
    this.teaSprite.start();
    this.ladyFervieSprite.lookUp();
    setTimeout(() => {
      this.ladyFervieSprite.neutralMirror();
      setTimeout(() => {
        this.ladyFervieSprite.danceMirror();
        setTimeout(() => {
          this.ladyFervieSprite.neutralMirror();
        }, 2000);
      }, 1000);
    }, 2000);
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
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.WALK_BEHIND_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isColliding(direction, fervieFootX, fervieFootY) {
    return (this.ladyFervieSprite.isCollidingWithLady(direction, fervieFootX, fervieFootY, this.scaleAmountX, this.scaleAmountY));
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.BACKGROUND_IMAGE);
    let towelImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.TOWEL_IMAGE);
    let putawayImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.PANS_PUT_AWAY_IMAGE);
    let stoveImage = this.animationLoader.getStaticImage(p5, HouseInsideKitchen.PANS_ON_STOVE_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if (this.isSettledIn && this.homeActivity === GameState.HomeActivity.COOKING) {
      p5.image(stoveImage, 0, 0);
      this.smokeSprite.draw(p5);
      this.teaSprite.draw(p5);
    } else {
      p5.image(putawayImage, 0, 0);
    }

    if (this.isTowelPresent) {
      p5.image(towelImage, 0, 0);
    }

    if (this.isTowelPresent && this.isOverTowelPosition(p5, p5.mouseX, p5.mouseY)
    || this.isOverLady(p5.mouseX, p5.mouseY)) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    if (!this.ladyFervieSprite.isFervieBehindLady(fervie, this.scaleAmountX, this.scaleAmountY)) {
      this.ladyFervieSprite.draw(p5);
    }

    p5.pop();
  }


  isOverLady(x, y) {
    return this.ladyFervieSprite.isOverLady(this.getScaledX(x), this.getScaledY(y));
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

    if (this.ladyFervieSprite.isFervieBehindLady(fervie, this.scaleAmountY, this.scaleAmountY)) {
      this.ladyFervieSprite.draw(p5);
    }

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(wall, 0, 0);
    }
    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  mousePressed(p5, fervie) {

    if (this.isTowelPresent
      && !this.globalHud.hasActiveItemSelection()
      && this.isCloseToTowel(fervie)
      && this.isOverTowelPosition(p5, p5.mouseX, p5.mouseY)) {
      this.globalHud.setGameStateProperty(GameState.Property.IS_TOWEL_PICKED_UP, true);
      this.isTowelPresent = false;
      this.movingTowelToInventory = true;
    }

    if (this.isOverLady(p5.mouseX, p5.mouseY) && this.ladyFervieSprite.isNextToLady(fervie, this.scaleAmountX, this.scaleAmountY)) {
      if (!fervie.isKissing) {
        this.kissAnimation(fervie);
      }
    }
  }

  kissAnimation(fervie) {
    if (this.ladyFervieSprite.isToLeftOfLady(fervie.getFervieFootX(), this.scaleAmountX)) {
      fervie.kissMirror();
      this.ladyFervieSprite.loveMirror();
    } else {
      fervie.kiss();
      this.ladyFervieSprite.love();
    }

    setTimeout(() => {
      fervie.stopKissing();
      this.ladyFervieSprite.neutralMirror();
    }, 2000);
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.ladyFervieSprite.update(p5, this);
    this.smokeSprite.update(p5, this);
    this.teaSprite.update(p5, this);

    if (this.movingTowelToInventory) {
      this.globalHud.addInventoryItem(Inventory.ItemType.TOWEL);
      this.movingTowelToInventory = false;
    }
  }
}
