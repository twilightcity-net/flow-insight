/**
 * Creates our lake in the woods environment for Fervie to walk around in
 */
import Environment from "./Environment";
import LadyFervieSprite from "../characters/LadyFervieSprite";


export default class LakeInTheWoods extends Environment {

  static GROUND_IMAGE = "./assets/animation/lake/fervie_lake_ground.png";
  static OVERLAY_IMAGE = "./assets/animation/lake/fervie_lake_overlay.png";
  static SKY_IMAGE = "./assets/animation/lake/fervie_lake_sky.png";
  static WALK_BEHIND_OVERLAY_IMAGE = "./assets/animation/lake/fervie_lake_trees.png";
  static WALK_AREA_IMAGE = "./assets/animation/lake/fervie_lake_walk_area.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/lake/fervie_lake_walk_area_behind.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.SKY_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);

    this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_AREA_IMAGE);

    this.ladyFervieSprite = new LadyFervieSprite(
      this.animationLoader,
      Math.round((LakeInTheWoods.IMAGE_WIDTH - 105)),
      Math.round(LakeInTheWoods.IMAGE_HEIGHT / 2 + 20),
      100);
    this.ladyFervieSprite.preload(p5);
  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getSouthSpawnProperties() {
    console.log("getSouthSpawnPoint");
    return {x: Math.round(150 * this.scaleAmountX), y: Math.round((LakeInTheWoods.IMAGE_HEIGHT - 180) * this.scaleAmountY), scale: 0.8};
  }


  isValidPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
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
    let skyImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.SKY_IMAGE);
    let groundImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.GROUND_IMAGE);
    let trees =  this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(skyImage, 0, 0);
    p5.image(groundImage, 0, 0);

    if (!this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(trees, 0, 0);
      this.ladyFervieSprite.draw(p5);
    }


    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, LakeInTheWoods.OVERLAY_IMAGE);
    let trees =  this.animationLoader.getStaticImage(p5, LakeInTheWoods.WALK_BEHIND_OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(trees, 0, 0);
      this.ladyFervieSprite.draw(p5);
    }

    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.ladyFervieSprite.update(p5);
  }

}
