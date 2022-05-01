/**
 * Creates our lake in the woods environment for Fervie to walk around in
 */
import Environment from "./Environment";

export default class CityTransition extends Environment {
  static GROUND_IMAGE = "./assets/animation/city_transition/city_transition_background.png";
  static KEYWALL_IMAGE =
    "./assets/animation/city_transition/city_transition_keywall.png";
  static OVERLAY_IMAGE =
    "./assets/animation/city_transition/city_transition_overlay.png";
  static WALK_AREA_IMAGE =
    "./assets/animation/city_transition/city_transition_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(
      p5,
      CityTransition.GROUND_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityTransition.KEYWALL_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityTransition.OVERLAY_IMAGE
    );

    this.animationLoader.getStaticImage(
      p5,
      CityTransition.WALK_AREA_IMAGE
    );
  }

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getRightSpawnProperties() {
    console.log("getRightSpawnProperties");
    return {
      x: Math.round((CityTransition.IMAGE_WIDTH - 100) * this.scaleAmountX),
      y: Math.round((CityTransition.IMAGE_HEIGHT - 140) * this.scaleAmountY),
      scale: 0.3,
    };
  }

  getLeftSpawnProperties() {
    console.log("getLeftSpawnProperties");
    return {
      x: Math.round(100 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 140) * this.scaleAmountY),
      scale: 0.3
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      CityTransition.WALK_AREA_IMAGE
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

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage =
      this.animationLoader.getStaticImage(
        p5,
        CityTransition.GROUND_IMAGE
      );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let keywallImage = this.animationLoader.getStaticImage(
      p5,
      CityTransition.KEYWALL_IMAGE
    );
    let overlayImage = this.animationLoader.getStaticImage(
      p5,
      CityTransition.OVERLAY_IMAGE
    );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(keywallImage, 0, 0);
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
