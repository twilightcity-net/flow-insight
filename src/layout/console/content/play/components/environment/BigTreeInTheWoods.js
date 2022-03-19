/**
 * Creates our big tree in the woods environment for Fervie to walk around in
 */
import Environment from "./Environment";
import FervieSprite from "../fervie/FervieSprite";


export default class BigTreeInTheWoods extends Environment {

  static GROUND_IMAGE = "./assets/animation/bigtree/woods_big_tree_ground.png";
  static OVERLAY_IMAGE = "./assets/animation/bigtree/woods_big_tree_overlay.png";
  static SKY_IMAGE = "./assets/animation/bigtree/woods_big_tree_sky.png";
  static WALK_BEHIND_OVERLAY_IMAGE = "./assets/animation/bigtree/woods_big_tree_tree.png";
  static WALK_AREA_IMAGE = "./assets/animation/bigtree/woods_big_tree_walk_area.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/bigtree/woods_big_tree_walk_area_behind.png";
  static WALK_AREA_TRIGGER_IMAGE = "./assets/animation/bigtree/woods_big_tree_walk_area_trigger.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.SKY_IMAGE);
    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);

    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_BEHIND_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_AREA_TRIGGER_IMAGE);

    this.downTheHill = false;
  }

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getRightSpawnProperties() {
    console.log("getRightSpawnPoint");
    return {x: Math.round((Environment.IMAGE_WIDTH - 70) * this.scaleAmountX), y: Math.round(170 * this.scaleAmountY)};
  }

  getNorthSpawnProperties() {
    console.log("getNorthSpawnPoint");
    return {
      x:Math.round((Environment.IMAGE_WIDTH /2 ) * this.scaleAmountX),
      y:Math.round(190 * this.scaleAmountY),
      scale: 0.7,
      upTheHill: true, yDownTheHill: 40};
  }

  isValidPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_BEHIND_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isPathTriggerPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_AREA_TRIGGER_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  hasFervieMovingNorth(fervie) {
    if (fervie.getDistanceDownTheHill() >= 48) {
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
    let skyImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.SKY_IMAGE);
    let groundImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.GROUND_IMAGE);
    let bigTree =  this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);


    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(skyImage, 0, 0);
    p5.image(groundImage, 0, 0);

    if (!this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(bigTree, 0, 0);
    }

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let groundImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.GROUND_IMAGE);
    let overlayImage = this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.OVERLAY_IMAGE);
    let bigTree =  this.animationLoader.getStaticImage(p5, BigTreeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(bigTree, 0, 0);
    }

    if (fervie.isBehindTheHill()) {
      p5.image(groundImage, 0, 0);
      p5.image(bigTree, 0, 0);
      p5.image(overlayImage, 0, 0);
    } else {
      p5.image(overlayImage, 0, 0);
    }

    p5.pop();
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    if (fervie.getDirection() === FervieSprite.Direction.Up &&
      this.isPathTriggerPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())
      && !this.downTheHill) {
      this.downTheHill = true;
      fervie.triggerDownTheHill();

    } else if (this.downTheHill &&
      fervie.getDirection() === FervieSprite.Direction.Down) {
      this.downTheHill = false;
      fervie.triggerUpTheHill();
    }
  }

}
