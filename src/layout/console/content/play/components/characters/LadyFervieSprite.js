import AnimationId from "../AnimationId";
import LadyGlowSprite from "./LadyGlowSprite";

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
    this.isGlowing = false;
    this.isNeutral = false;
    this.isRidingFish = false;

    this.fishySprite = null;

    this.ladyGlow = new LadyGlowSprite(this.animationLoader);
  }

  static UNSCALED_IMAGE_WIDTH = 376;
  static UNSCALED_IMAGE_HEIGHT = 274;

  static DANCE_LEFT_IMAGE = "./assets/animation/fervie/fervie_lady_dance_left.png";
  static DANCE_RIGHT_IMAGE = "./assets/animation/fervie/fervie_lady_dance_right.png";
  static DANCE_MIDDLE_IMAGE = "./assets/animation/fervie/fervie_lady_dance_middle.png";

  static NEUTRAL_IMAGE = "./assets/animation/fervie/fervie_lady_neutral.png";
  static RIDES_FISH = "./assets/animation/fervie/fervie_lady_rides.png";

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
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_IMAGE);

    this.ladyGlow.preload(p5);
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
      image = this.handleReadAndBlinkAnimation(image, p5);
    } else if (this.isDancing) {
      image = this.handleDanceAnimation(p5, image);
    } else if (this.isGlowing) {
      this.ladyGlow.draw(p5, this.x - 148, this.y - 40, 0.3);
    } else if (this.isNeutral) {
      image = this.handleNeutralPose(p5, image);
    }
    if (this.isRidingFish) {
      image = this.handleRidingFishAnimation(p5, image);
    }

    p5.pop();
  }

  getFootPositionX() {
    return this.x + ((LadyFervieSprite.UNSCALED_IMAGE_WIDTH/2 - 55)*0.3);
  }

  getFootPositionY() {
    return this.y + ((LadyFervieSprite.UNSCALED_IMAGE_HEIGHT/2 + 60)*0.3);
  }

  handleRidingFishAnimation(p5, image) {
    p5.translate(this.x + 50, this.y - 40);
    p5.scale(0.3, 0.3);

    image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.RIDES_FISH);
    p5.image(image, 0, 0);
    return image;
  }

  handleNeutralPose(p5, image) {
    let scale = 0.3;
    p5.translate(this.x, this.y - 35);
    p5.scale(scale, scale);

    image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_IMAGE);
    p5.image(image, 0, 0);
    return image;
  }



  handleDanceAnimation(p5, image) {
    p5.translate(this.x, this.y - 35);
    p5.scale(0.3, 0.3);

    let danceFrame = this.animationFrame % 12;

    //4 left, 2 mid, 4 right, 2 mid

    if (this.isBetween(danceFrame, 0, 3)) {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_LEFT_IMAGE);
    } else if (this.isBetween(danceFrame, 6, 9)) {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_RIGHT_IMAGE);
    } else {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.DANCE_MIDDLE_IMAGE);
    }
    p5.image(image, 0, 0);
    return image;
  }

  handleReadAndBlinkAnimation(image, p5) {
    if (this.animationFrame < 115) {
      image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 1, this.size);
    } else {
      console.log("blink!");
      image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 2, this.size);
    }

    p5.image(image, this.x, this.y);
    return image;
  }

  isBetween(frame, frameLow, frameHigh) {
    return frame >= frameLow && frame <= frameHigh;
  }


  dance() {
    this.isDancing = true;
    this.isReadingAndBlinking = false;
    this.isGlowing = false;
    this.isNeutral = false;
  }

  stopDancing() {
    this.isDancing = false;
    this.isNeutral = true;
  }

  ride(fishy) {
    this.isRidingFish = true;
    this.x = fishy.getAdjustedX();
    this.y = fishy.getAdjustedY();
    this.fishySprite = fishy;

    this.isNeutral = false;
    this.isReadingAndBlinking = false;
    this.isGlowing = false;
    this.isNeutral = false;
  }

  dismount(x, y) {
    this.isRidingFish = false;
    this.isNeutral = true;
    this.fishySprite = null;
    this.x = x;
    this.y = y;
  }

  startGlow() {
    if (this.isDancing || this.isNeutral) {
      this.isGlowing = true;
      this.isDancing = false;
      this.isReadingAndBlinking = false;
      this.isNeutral = false;
      this.ladyGlow.startChanneling();
    }
  }

  stopGlow() {
    if (this.isGlowing) {
      this.ladyGlow.stopChanneling();
      this.isGlowing = false;
      this.isNeutral = true;
    }
  }

  isChanneling() {
    return this.ladyGlow.isChanneling;
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

    if (this.isRidingFish && this.fishySprite) {
      this.x = this.fishySprite.getAdjustedX();
      this.y = this.fishySprite.getAdjustedY();
    }

    this.ladyGlow.update(p5, environment);
  }

}
