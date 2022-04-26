/**
 * Creates our inside house map, the kitchen inside the house
 */
import Environment from "./Environment";

export default class HouseInsideKitchen extends Environment {
  static BACKGROUND_IMAGE =
    "./assets/animation/insidehouse/house_inside_kitchen_background.png";
  static OVERLAY_IMAGE =
    "./assets/animation/insidehouse/house_inside_kitchen_overlay.png";
  static WALK_AREA_IMAGE =
    "./assets/animation/insidehouse/house_inside_kitchen_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE =
    "./assets/animation/insidehouse/house_inside_kitchen_walkarea_behind.png";

  static WALK_BEHIND_WALL =
    "./assets/animation/insidehouse/house_inside_kitchen_behindwall.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.BACKGROUND_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_BEHIND_WALL
    );
    this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.OVERLAY_IMAGE
    );

    this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_AREA_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_BEHIND_AREA_IMAGE
    );
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
        HouseInsideKitchen.BACKGROUND_IMAGE
      );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let overlayImage = this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.OVERLAY_IMAGE
    );

    let wall = this.animationLoader.getStaticImage(
      p5,
      HouseInsideKitchen.WALK_BEHIND_WALL
    );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (
      this.isWalkBehindPosition(
        p5,
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      p5.image(wall, 0, 0);
    }
    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  mousePressed(p5, fervie) {
    //click on pots and pans
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
  }
}
