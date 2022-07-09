/**
 * Creates our city music night scene for jammin to fervie beats
 */
import Environment from "./Environment";
import Drum from "../sound/Drum";

export default class CityMusic extends Environment {
  static GROUND_IMAGE = "./assets/animation/city_music/city_music_square_background.png";
  static INSTRUMENTS_IMAGE = "./assets/animation/city_music/city_music_square_instruments.png";
  static OVERLAY_IMAGE = "./assets/animation/city_music/city_music_square_overlay.png";
  static WALK_AREA_IMAGE = "./assets/animation/city_music/city_music_square_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, CityMusic.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, CityMusic.INSTRUMENTS_IMAGE);
    this.animationLoader.getStaticImage(p5, CityMusic.OVERLAY_IMAGE);
    this.animationLoader.getStaticImage(p5, CityMusic.WALK_AREA_IMAGE);

    this.drum = new Drum();
    this.drum.preload(p5);
  }

  unload(p5) {
    this.drum.unload(p5);
  }

  getDefaultSpawnProperties() {
    return this.getLeftSpawnProperties();
  }

  getLeftSpawnProperties() {
    console.log("getLeftSpawnProperties");
    return {
      x: Math.round(100 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 160) * this.scaleAmountY),
      scale: 0.3
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, CityMusic.WALK_AREA_IMAGE);

    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, CityMusic.GROUND_IMAGE);
    let instrumentsImage = this.animationLoader.getStaticImage(p5, CityMusic.INSTRUMENTS_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);
    p5.image(backgroundImage, 0, 0);
    p5.image(instrumentsImage, 0, 0);

    p5.pop();

    this.drum.draw(p5);
  }

  drawOverlay(p5, fervie) {

    let overlayImage = this.animationLoader.getStaticImage(p5, CityMusic.OVERLAY_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(overlayImage, 0, 0);

    p5.pop();
  }

  mousePressed(p5, fervie) {
    this.drum.mousePressed(p5, fervie);
  }

  mouseReleased(p5, fervie) {
    this.drum.mouseReleased(p5, fervie);
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.drum.update(p5);
  }
}
