/**
 * Creates our fervie garden behind the shroom house
 */
import Environment from "./Environment";

export default class FervieGarden extends Environment {
  static GROUND_IMAGE = "./assets/animation/garden/fervie_garden_background.png";
  static OVERLAY_IMAGE = "./assets/animation/garden/fervie_garden_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/garden/fervie_garden_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, FervieGarden.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, FervieGarden.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, FervieGarden.WALK_AREA_IMAGE);
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

    return super.isWithinTargetArea(walkAreaImage, x, y);
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

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(p5, FervieGarden.OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);
    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
  }
}
