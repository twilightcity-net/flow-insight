import AnimationId from "../AnimationId";

/**
 * Creates our monty sprite animation
 */

export default class MontySprite {
  constructor(animationLoader, x, y, scale) {
    this.animationLoader = animationLoader;
    this.x = x - (MontySprite.UNSCALED_IMAGE_WIDTH/2*scale);
    this.y = y;
    this.adjustX = 0;
    this.scale = scale;
    this.animationFrame = 1;

    this.isInitialized = false;
  }

  static UNSCALED_IMAGE_WIDTH = 242;
  static UNSCALED_IMAGE_HEIGHT = 237;

  static MONTY_GRIN_IMAGE = "./assets/animation/monty/monty_grin.png";
  static MONTY_EXCITED_IMAGE = "./assets/animation/monty/monty_excited.png";
  static MONTY_WATCH_IMAGE = "./assets/animation/monty/monty_watch_right.png";
  static MONTY_EYELIDS_IMAGE = "./assets/animation/monty/monty_eyelids.png";
  static MONTY_GRIN_EYELIDS_IMAGE = "./assets/animation/monty/monty_grin_eyelids.png";


  /**
   * Preload all the images needed to draw the sprite
   * @param p5
   */
  preload(p5) {
    this.animationLoader.getStaticImage(p5, MontySprite.MONTY_GRIN_IMAGE);
    this.animationLoader.getStaticImage(p5, MontySprite.MONTY_EXCITED_IMAGE);
    this.animationLoader.getStaticImage(p5, MontySprite.MONTY_WATCH_IMAGE);
    this.animationLoader.getStaticImage(p5, MontySprite.MONTY_EYELIDS_IMAGE);
    this.animationLoader.getStaticImage(p5, MontySprite.MONTY_GRIN_EYELIDS_IMAGE);
  }

  /**
   * Draw the cow sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    //24 frames per second, blinks every 5 seconds for ~1/4 second




    let image = this.getImageBasedOnPosition(p5);
    let blinkOverlay = this.getOptionalBlinkOverlay(p5);

    p5.push();
    p5.translate(this.x - this.adjustX + 1280, this.y);
    p5.scale(this.scale, this.scale);

    if (!this.isInitialized) {
      let preload = this.animationLoader.getStaticImage(p5, MontySprite.MONTY_EXCITED_IMAGE);
      p5.image(preload, 0, 0);
      this.isInitialized = true;
    }

    p5.image(image, 0, 0);
    if (blinkOverlay) {
      p5.image(blinkOverlay, 0, 0);
    }
    p5.pop()
  }


  getOptionalBlinkOverlay(p5) {
    if (this.animationFrame < 115) {
      return null;
    } else {
      if (this.adjustX <= 830) {
        return this.animationLoader.getStaticImage(p5, MontySprite.MONTY_GRIN_EYELIDS_IMAGE);
      } else {
        return this.animationLoader.getStaticImage(p5, MontySprite.MONTY_EYELIDS_IMAGE);
      }
    }
  }

  getImageBasedOnPosition(p5) {
    if (this.adjustX === 1280 || this.adjustX > 1100) {
      return this.animationLoader.getStaticImage(p5, MontySprite.MONTY_WATCH_IMAGE);
    } else if (this.adjustX > 830 && this.adjustX < 1280) {
      return this.animationLoader.getStaticImage(p5, MontySprite.MONTY_EXCITED_IMAGE);
    } else {
      return this.animationLoader.getStaticImage(p5, MontySprite.MONTY_GRIN_IMAGE);
    }
  }

  adjustXBasedOnScroll(adjustAmount) {
    this.adjustX = adjustAmount;
  }

  //so my initial position is 200, when I'm scrolled all the way to 1280
  //then when I'm scrolling, I want to move him to the right.

  //so if my x, y that's passed in, is an image x, y,  1500 (then when 1500 is in the center of screen)

  //[1280, 2560]

  //then the position of Monty when

  //then if

  //then the position on the screen, is to shift the entire canvas to the left

  /**
   * Update the monty sprite properties for each subsequent frame,
   * updating the relative frame number for tracking the blink loop
   */
  update(p5, environment) {
    this.animationFrame++;

    if (this.animationFrame > 120) {
      this.animationFrame = 1;
    }
  }
}
