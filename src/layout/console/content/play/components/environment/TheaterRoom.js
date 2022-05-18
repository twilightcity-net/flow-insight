/**
 * Creates our moovie theater environment in TC
 */
import Environment from "./Environment";

export default class TheaterRoom extends Environment {
  static GROUND_IMAGE = "./assets/animation/theater/theater_room_background.png";
  static CHAIRS_BACK_IMAGE = "./assets/animation/theater/theater_room_chairs_back.png";
  static CHAIRS_MID_IMAGE = "./assets/animation/theater/theater_room_chairs_mid.png";
  static CHAIRS_FRONT_IMAGE = "./assets/animation/theater/theater_room_chairs_front.png";
  static SHADOW_IMAGE = "./assets/animation/theater/theater_room_shadow.png";

  static WALK_AREA_IMAGE = "./assets/animation/theater/theater_room_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, TheaterRoom.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_BACK_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.SHADOW_IMAGE);

    this.animationLoader.getStaticImage(p5, TheaterRoom.WALK_AREA_IMAGE);
  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }


  getSouthSpawnProperties() {
    console.log("getSouthSpawnProperties");
    return {
      x: Math.round(50 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 150) * this.scaleAmountY),
      scale: 0.4
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, TheaterRoom.WALK_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {

    fervie.adjustDown(20);

    let backgroundImage = this.animationLoader.getStaticImage(p5, TheaterRoom.GROUND_IMAGE);
    let chairsMid = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    let chairsFront = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if (this.isBehindFrontRow(fervie)) {
      p5.image(chairsFront, 0, 0);
    }

    if (this.isBehindMiddleRow(fervie)) {
      p5.image(chairsMid, 0, 0);
    }

    // p5.textSize(18);
    // p5.textAlign(p5.CENTER);
    // p5.textFont('sans-serif');
    // p5.fill(255, 255, 255);
    // p5.text("Your Moovie is about to begin...", Environment.IMAGE_WIDTH/2 - 200, Environment.IMAGE_HEIGHT/2 - 60, 400, 80);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let shadow = this.animationLoader.getStaticImage(p5, TheaterRoom.SHADOW_IMAGE);
    let chairsBack = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_BACK_IMAGE);
    let chairsMid = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    let chairsFront = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (!this.isBehindFrontRow(fervie)) {
      p5.image(chairsFront, 0, 0);
    }

    if (!this.isBehindMiddleRow(fervie)) {
      p5.image(chairsMid, 0, 0);
    }

    p5.image(chairsBack, 0, 0);
    p5.image(shadow, 0, 0);
    p5.pop();
  }

  isBehindFrontRow(fervie) {
    const adjustY = (fervie.getFervieFootY() / this.scaleAmountY);
    return adjustY > 420;
  }

  isBehindMiddleRow(fervie) {
    const adjustY = (fervie.getFervieFootY() / this.scaleAmountY);
    return adjustY > 450;
  }

  mousePressed(p5, fervie) {
    console.log((fervie.getFervieFootY() / this.scaleAmountY));
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
  }
}
