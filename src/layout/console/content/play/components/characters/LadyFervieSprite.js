import AnimationId from "../AnimationId";

/**
 * Creates our fervie sprite animation
 */

export default class LadyFervieSprite {
  constructor(animationLoader, x, y, size) {
    this.animationLoader = animationLoader;
    this.x = x - size / 2 - 10;
    this.y = y - 20;
    this.size = size;
    this.animationFrame = 1;
    this.isDancing = false;
    this.isReadingAndBlinking = true;
  }

  static UNSCALED_IMAGE_WIDTH = 376;
  static UNSCALED_IMAGE_HEIGHT = 274;

  static DANCE_LEFT_IMAGE = "./assets/animation/fervie/fervie_girl_dance_left.png";
  static DANCE_RIGHT_IMAGE = "./assets/animation/fervie/fervie_girl_dance_right.png";
  static DANCE_MIDDLE_IMAGE = "./assets/animation/fervie/fervie_girl_dance_middle.png";



  /**
   * Preload all the images by processing the svgs with the colors then flattening to images
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 1, this.size);
    this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 2, this.size);

    this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_LEFT_IMAGE);
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_MIDDLE_IMAGE);
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_RIGHT_IMAGE);

  }

  /**
   * Draw the fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    //24 frames per second, blinks every 5 seconds for ~1/4 second

    p5.push();

    let image = null;

    if (this.isReadingAndBlinking) {
      if (this.animationFrame < 115) {
        image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 1, this.size);
      } else {
        console.log("blink!");
        image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 2, this.size);
      }

      p5.image(image, this.x, this.y);
    }

    if (this.isDancing) {

      p5.translate(this.x, this.y - 35);
      p5.scale(0.3, 0.3);

      let danceFrame = this.animationFrame % 12;

      //4 left, 2 mid, 4 right, 2 mid

      if (this.isBetween(danceFrame , 0, 3)) {
        image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_LEFT_IMAGE);
      } else if (this.isBetween(danceFrame , 6, 9)) {
        image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_RIGHT_IMAGE);
      } else {
        image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_MIDDLE_IMAGE);
      }
      p5.image(image, 0, 0);
    }



    p5.pop();
  }

  isBetween(frame, frameLow, frameHigh) {
    return frame >= frameLow && frame <= frameHigh;
  }

  /**
   * Update the lady fervie sprite properties for each subsequent frame,
   * updating the relative frame number for tracking the blink loop
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 120) {
      this.animationFrame = 1;
    }
  }

  dance() {
    this.isDancing = true;
    this.isReadingAndBlinking = false;
  }

  stopDancing() {
    this.isDancing = false;
    this.isReadingAndBlinking = true;
  }
}
