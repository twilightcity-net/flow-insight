/**
 * Creates our mushroom house in the woods environment for Fervie to walk around in
 */
import AnimationId from "../AnimationId";
import Environment from "./Environment";


export default class ShroomHouseInTheWoods extends Environment {
  constructor(animationLoader, width, height) {
    super(animationLoader, width, height);
  }

  static GROUND_IMAGE = "./assets/animation/shroomhouse/fervie_home_ground.png";
  static OVERLAY_IMAGE = "./assets/animation/shroomhouse/fervie_home_overlay.png";
  static SKY_IMAGE = "./assets/animation/shroomhouse/fervie_home_sky.png";
  static WALK_AREA_IMAGE = "./assets/animation/shroomhouse/fervie_home_walk_area.png";
  static WALK_BEHIND_AREA_IMAGE = "./assets/animation/shroomhouse/fervie_home_walk_area_behind.png";


  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {

    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SKY_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.OVERLAY_IMAGE);

    this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_BEHIND_AREA_IMAGE);
  }

  getDefaultSpawnPoint() {
    return this.getLeftSpawnPoint();
  }

  getLeftSpawnPoint() {
    let spawnPoint = [Math.round(40 * this.scaleAmountX), Math.round(170 * this.scaleAmountY)];
    return spawnPoint;
  }

  getSouthSpawnPoint() {
    return [Math.round(this.width / 2), Math.round(170 * this.scaleAmountY)];
  }

  isValidPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.WALK_BEHIND_AREA_IMAGE);

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
    let skyImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.SKY_IMAGE);
    let groundImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.GROUND_IMAGE);
    let houseImage = this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(skyImage, 0, 0);
    p5.image(groundImage, 0, 0);

    if (!this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(houseImage, 0, 0);
    }


    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, ShroomHouseInTheWoods.OVERLAY_IMAGE);
    let houseImage = this.animationLoader.getStaticSvgImage(p5, AnimationId.Animation.ShroomHouse);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(houseImage, 0, 0);
    }
    p5.image(overlayImage, 0, 0);
    p5.pop();
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5) {
    super.update(p5);
  }

}
