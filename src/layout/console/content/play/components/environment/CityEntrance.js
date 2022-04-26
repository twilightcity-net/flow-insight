/**
 * Creates our lake in the woods environment for Fervie to walk around in
 */
import Environment from "./Environment";

export default class CityEntrance extends Environment {
  static GROUND_IMAGE =
    "./assets/animation/city_entrance/city_entrance_background.png";
  static HOUSES_IMAGE =
    "./assets/animation/city_entrance/city_entrance_houses.png";
  static LAMPS_IMAGE =
    "./assets/animation/city_entrance/city_entrance_lamps.png";
  static SHADOW_IMAGE =
    "./assets/animation/city_entrance/city_entrance_shadow.png";

  static WALK_AREA_IMAGE =
    "./assets/animation/city_entrance/city_entrance_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE =
    "./assets/animation/city_entrance/city_entrance_walkarea_behind.png";
  static WALK_BEHIND2_AREA_IMAGE =
    "./assets/animation/city_entrance/city_entrance_walkarea_behind2.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.GROUND_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.HOUSES_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.LAMPS_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.SHADOW_IMAGE
    );

    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_AREA_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_BEHIND_AREA_IMAGE
    );
    this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_BEHIND2_AREA_IMAGE
    );
  }

  getDefaultSpawnProperties() {
    return this.getRightSpawnProperties();
  }

  getRightSpawnProperties() {
    console.log("getRightSpawnProperties");
    return {
      x: Math.round(
        (CityEntrance.IMAGE_WIDTH - 100) * this.scaleAmountX
      ),
      y: Math.round(
        (CityEntrance.IMAGE_HEIGHT - 120) *
          this.scaleAmountY
      ),
      scale: 0.2,
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_AREA_IMAGE
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

  isWalkBehindLampsPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_BEHIND_AREA_IMAGE
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

  isWalkBehindHousesPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.WALK_BEHIND2_AREA_IMAGE
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
        CityEntrance.GROUND_IMAGE
      );
    let housesImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.HOUSES_IMAGE
    );
    let lampsImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.LAMPS_IMAGE
    );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    let walkBehindHouses = this.isWalkBehindHousesPosition(
      p5,
      fervie.getFervieFootX(),
      fervie.getFervieFootY()
    );
    let walkBehindLamps = this.isWalkBehindLampsPosition(
      p5,
      fervie.getFervieFootX(),
      fervie.getFervieFootY()
    );

    if (!walkBehindHouses) {
      p5.image(housesImage, 0, 0);
    }

    if (!walkBehindLamps && !walkBehindHouses) {
      p5.image(lampsImage, 0, 0);
    }

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let shadowOverlay = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.SHADOW_IMAGE
    );
    let housesImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.HOUSES_IMAGE
    );
    let lampsImage = this.animationLoader.getStaticImage(
      p5,
      CityEntrance.LAMPS_IMAGE
    );

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (
      this.isWalkBehindHousesPosition(
        p5,
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      p5.image(housesImage, 0, 0);
      p5.image(lampsImage, 0, 0);
    }

    if (
      this.isWalkBehindLampsPosition(
        p5,
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      p5.image(lampsImage, 0, 0);
    }

    p5.tint(255, Math.round(220));
    p5.image(shadowOverlay, 0, 0);

    p5.pop();
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
  }
}
