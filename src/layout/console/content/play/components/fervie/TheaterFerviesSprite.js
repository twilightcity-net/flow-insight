import AnimationId from "../AnimationId";
import FervieWalkUp from "./FervieWalkUp";

/**
 * Creates our friend fervies sitting in the theater
 */

export default class TheaterFerviesSprite {
  constructor(animationLoader) {
    this.animationLoader = animationLoader;
    this.animationFrame = 1;

    this.isVisible = true;
  }

  static UNSCALED_IMAGE_WIDTH = 543;
  static UNSCALED_IMAGE_HEIGHT = 443;

  static SCALED_WIDTH = 360;

  static STATIC_SCALE_RATIO = TheaterFerviesSprite.SCALED_WIDTH / TheaterFerviesSprite.UNSCALED_IMAGE_WIDTH;

  static IMAGE_FAMILY = "FervieSit";

  /**
   * Preload the fervie images needed for display based on the initial data
   * @param p5
   * @param fervieSeatMappings
   */
  preload(p5, fervieSeatMappings) {

    this.seatedFervies = [];

    for (let fervie of fervieSeatMappings) {
      let coloredSvg = FervieWalkUp.getFrame(1, fervie.fervieColor, null);

      this.animationLoader.loadPrecoloredSvg(p5, TheaterFerviesSprite.IMAGE_FAMILY, fervie.fervieColor, coloredSvg);

    }
  }

  preloadFervie(p5, fervieSeatMapping) {
    let coloredSvg = FervieWalkUp.getFrame(1, fervieSeatMapping.fervieColor, null);
    this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.FervieWalkUp, 1, 360);
    this.animationLoader.loadPrecoloredSvg(p5, TheaterFerviesSprite.IMAGE_FAMILY, fervieSeatMapping.fervieColor, coloredSvg);
  }

  /**
   * All fervies in the list should already be preloaded and ready for display in the draw loop
   * Once this is set, all positioned fervies will be displayed drawn
   * @param seatedFervies
   */
  refreshFervies(seatedFervies) {
    console.log("refresh fervies!");
    console.log(seatedFervies);
    this.seatedFervies = seatedFervies;
  }

  /**
   * Draw the sitting fervie sprites in the first row of the theater
   * @param p5
   * @param rowNumber
   */
  drawRow(p5, rowNumber) {

    for (let seatedFervie of this.seatedFervies) {
      if (seatedFervie.rowNumber === rowNumber) {
        let image = this.animationLoader.getPrecoloredSvg(TheaterFerviesSprite.IMAGE_FAMILY, seatedFervie.fervieColor);
        p5.push();
        p5.translate(seatedFervie.x + Math.round((360/2) * (1 - seatedFervie.scale)), seatedFervie.y + (120 * seatedFervie.scale));
        p5.scale(TheaterFerviesSprite.STATIC_SCALE_RATIO, TheaterFerviesSprite.STATIC_SCALE_RATIO);
        p5.scale(seatedFervie.scale, seatedFervie.scale);
        p5.image(image, 0, 0);
        p5.pop();
      }
    }
  }

  /**
   * Update the fervie
   */
  update(p5, environment) {
  }
}
