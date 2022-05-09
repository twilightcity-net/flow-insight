/**
 * Creates our lake in the woods environment for Fervie to walk around in
 */
import Environment from "./Environment";
import LadyFervieSprite from "../characters/LadyFervieSprite";
import Inventory from "../hud/Inventory";
import FishySprite from "../characters/FishySprite";
import GlowSprite from "../fervie/GlowSprite";

export default class LakeInTheWoods extends Environment {
  static GROUND_IMAGE = "./assets/animation/lake/fervie_lake_ground.png";
  static OVERLAY_IMAGE = "./assets/animation/lake/fervie_lake_overlay.png";
  static SKY_IMAGE = "./assets/animation/lake/fervie_lake_sky.png";
  static TREES_IMAGE = "./assets/animation/lake/fervie_lake_trees.png";
  static WALK_AREA_IMAGE = "./assets/animation/lake/fervie_lake_walk_area.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/lake/fervie_lake_walk_area_behind.png";
  static LAKE_CLICK_IMAGE = "./assets/animation/lake/fervie_lake_click.png";
  static LAKE_WATER_IMAGE = "./assets/animation/lake/fervie_lake_water.png";

  static ROPE_IMAGE = "./assets/animation/lake/fervie_lake_rope.png";
  static SWING_IMAGE = "./assets/animation/lake/fervie_lake_swing.png";

  constructor(animationLoader, width, height, globalHud) {
    super(animationLoader, width, height, globalHud);

    this.isRopeOnTree = false;
    this.isSwingOnTree = false;

    this.hasFishyTriggered = false;

    this.ladyFervieSprite = new LadyFervieSprite(
      this.animationLoader,
      Math.round(LakeInTheWoods.IMAGE_WIDTH - 105),
      Math.round(LakeInTheWoods.IMAGE_HEIGHT / 2 + 20),
      100
    );

    this.fishySprite = new FishySprite(this.animationLoader,
      LakeInTheWoods.IMAGE_WIDTH - 250, LakeInTheWoods.IMAGE_HEIGHT /2, 0.4);

    this.glowSprite = new GlowSprite(this.animationLoader, LakeInTheWoods.IMAGE_WIDTH/2 + 200, LakeInTheWoods.IMAGE_HEIGHT/2+80, 0.5 );
  }


  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.SKY_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.TREES_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.ROPE_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.SWING_IMAGE);

    this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_AREA_IMAGE);

    this.animationLoader.getStaticImage(p5, LakeInTheWoods.LAKE_CLICK_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.LAKE_WATER_IMAGE);

    this.ladyFervieSprite.preload(p5);
    this.fishySprite.preload(p5);
    this.glowSprite.preload(p5);

    this.isLakeGlowing = false;
    this.channelingCount = 0;

  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getSouthSpawnProperties() {
    console.log("getSouthSpawnPoint");
    return {
      x: Math.round(150 * this.scaleAmountX),
      y: Math.round(
        (LakeInTheWoods.IMAGE_HEIGHT - 180) *
          this.scaleAmountY
      ),
      scale: 0.8,
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isOverLakePosition(p5, x, y) {
    let lakeClickImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.LAKE_CLICK_IMAGE);
    return super.isWithinTargetArea(lakeClickImage, x, y);
  }

  /**
   * Returns true if the x,y position is over the left hand tree
   * @param p5
   * @param x
   * @param y
   * @returns {boolean}
   */
  isOverTreePosition(p5, x, y) {
    let treesImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.TREES_IMAGE);

    let adjustedX = Math.round(x / this.scaleAmountX);
    let adjustedY = Math.round(y / this.scaleAmountY);
    let color = treesImage.get(adjustedX, adjustedY)

    return !!(color && color[3] > 0 && adjustedX < 600);
  }


  isOnLakePeninsula(fervie) {
    return fervie.getFervieFootX() > 490 && fervie.getFervieFootY() > 250;
  }
  /**
   * Create the swing on the tree if the active selection is the right one
   * @param p5
   * @param fervie
   */
  mousePressed(p5, fervie) {
    if (this.isOverTreePosition(p5, p5.mouseX, p5.mouseY )) {
      this.handleApplyItemToTree();
    }

    if (this.isOverLakePosition(p5, p5.mouseX, p5.mouseY) && this.isOnLakePeninsula(fervie)) {
      console.log("handle lake channeling!");
      this.handleLakeChanneling(fervie);
    }
  }

  handleLakeChanneling(fervie) {
    if (!this.isLakeGlowing && !this.hasFishyTriggered) {
      console.log("start glow!");
      this.isLakeGlowing = true;
      this.glowSprite.startReappear();
      fervie.startGlowChanneling();

      if (this.isSwingOnTree) {
        this.glowTimeout = setTimeout(() => {
          this.ladyFervieSprite.startGlow();
          this.glowSprite.startSecondaryGlow();
          this.channelingCount = 0;
        }, 1000);
      }

    } else if (this.isLakeGlowing) {
      console.log("stop glow!");
      clearTimeout(this.glowTimeout);
      this.glowSprite.startDisappear();
      fervie.stopGlowChanneling();
      this.ladyFervieSprite.stopGlow();
      this.isLakeGlowing = false;

      if (this.fishySprite.isVisible()) {
        this.handleLadyFervieSwimmingAcrossTheLake();
      }
    }
  }

  handleLadyFervieSwimmingAcrossTheLake() {
    setTimeout(() => {
      this.ladyFervieSprite.ride(this.fishySprite);
    }, 3000);
    setTimeout(() => {
      this.fishySprite.swimAcrossLake();
    }, 3500);
    setTimeout(() => {
      this.ladyFervieSprite.dismount(LakeInTheWoods.IMAGE_WIDTH / 2 - 50, 230);
      this.fishySprite.dive();
    }, 12000);
  }

  handleApplyItemToTree() {
    let activeItem = this.globalHud.getActiveItemSelection();
    console.log("active item = " + activeItem);

    if (!this.isRopeOnTree && activeItem === Inventory.ItemType.ROPE) {
      this.isRopeOnTree = true;
      this.globalHud.consumeActiveInventoryItem();
    }
    if (this.isRopeOnTree && !this.isSwingOnTree && activeItem === Inventory.ItemType.TOWEL) {
      this.isSwingOnTree = true;
      this.globalHud.consumeActiveInventoryItem();
      this.ladyFervieSprite.dance();
    }
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let skyImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.SKY_IMAGE);
    let groundImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.GROUND_IMAGE);
    let trees = this.animationLoader.getStaticImage(p5, LakeInTheWoods.TREES_IMAGE);
    let water = this.animationLoader.getStaticImage(p5, LakeInTheWoods.LAKE_WATER_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(skyImage, 0, 0);
    p5.image(groundImage, 0, 0);

    this.fishySprite.draw(p5);
    p5.image(water, 0, 0);

    if (!this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(trees, 0, 0);
      this.ladyFervieSprite.draw(p5);
      this.drawRopeSwing(p5);
    }

    if (this.isOverTreePosition(p5, p5.mouseX, p5.mouseY)
      || (this.isOverLakePosition(p5, p5.mouseX, p5.mouseY))) {
      this.globalHud.setIsActionableHover(true, true);
    } else {
      this.globalHud.setIsActionableHover(false, true);
    }

    this.glowSprite.draw(p5);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.OVERLAY_IMAGE);
    let trees = this.animationLoader.getStaticImage(p5, LakeInTheWoods.TREES_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(trees, 0, 0);
      this.ladyFervieSprite.draw(p5);
      this.drawRopeSwing(p5);
    }

    if (this.fishySprite.adjustX < -280 && this.fishySprite.isVisible()) {
      let water = this.animationLoader.getStaticImage(p5, LakeInTheWoods.LAKE_WATER_IMAGE);
      this.fishySprite.draw(p5);
      p5.image(water, 0, 0);

      if (this.ladyFervieSprite.isRidingFish) {
        this.ladyFervieSprite.draw(p5);
      }
    }

    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  drawRopeSwing(p5) {
    if (this.isRopeOnTree && !this.isSwingOnTree) {
      let rope = this.animationLoader.getStaticImage(p5, LakeInTheWoods.ROPE_IMAGE);
      p5.image(rope, 0, 0);
    }
    if (this.isSwingOnTree) {
      let swing = this.animationLoader.getStaticImage(p5, LakeInTheWoods.SWING_IMAGE);
      p5.image(swing, 0, 0);
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.fishySprite.update(p5);
    this.ladyFervieSprite.update(p5);
    this.glowSprite.update(p5);

    if (fervie.isChanneling() && this.ladyFervieSprite.isChanneling()) {
      this.channelingCount++;
      if (this.channelingCount > 96 && this.isSwingOnTree) {
        this.fishySprite.emergeFromWater();
        this.hasFishyTriggered = true;
      }
    }
  }
}
