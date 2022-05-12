import AnimationId from "../AnimationId";
import LadyGlowSprite from "./LadyGlowSprite";
import LadyWalkSprite from "./LadyWalkSprite";
import LadySwingSprite from "./LadySwingSprite";
import HeartSprite from "./HeartSprite";

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

    this.currentAction = LadyFervieSprite.Action.Read;

    this.fishySprite = null;

    this.ladyGlow = new LadyGlowSprite(this.animationLoader);
    this.ladyWalk = new LadyWalkSprite(this.animationLoader, this.x, this.y, 0.35);
    this.ladySwing = new LadySwingSprite(this.animationLoader, 135, 128, 0.35);
    this.heart = new HeartSprite(this.animationLoader, this.x, this.y);
  }

  static UNSCALED_IMAGE_WIDTH = 376;
  static UNSCALED_IMAGE_HEIGHT = 274;

  static DANCE_LEFT_IMAGE = "./assets/animation/fervie/fervie_lady_dance_left.png";
  static DANCE_RIGHT_IMAGE = "./assets/animation/fervie/fervie_lady_dance_right.png";
  static DANCE_MIDDLE_IMAGE = "./assets/animation/fervie/fervie_lady_dance_middle.png";

  static NEUTRAL_IMAGE = "./assets/animation/fervie/fervie_lady_neutral.png";
  static LOVE_IMAGE = "./assets/animation/fervie/fervie_lady_love.png";
  static LOVE_BLINK_IMAGE = "./assets/animation/fervie/fervie_lady_love_blink.png";


  static RIDES_FISH = "./assets/animation/fervie/fervie_lady_rides.png";

  static get Action() {
    return {
      Dance: "Dance",
      RideFish: "RideFish",
      Read: "Read",
      Glow: "Glow",
      Walk: "Walk",
      Neutral: "Neutral",
      Swing: "Swing",
      Love: "Love"
    };
  }

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
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_IMAGE);
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_BLINK_IMAGE);

    this.ladyGlow.preload(p5);
    this.ladyWalk.preload(p5);
    this.ladySwing.preload(p5);
    this.heart.preload(p5);
  }


  /**
   * Draw the fervie sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    //24 frames per second, blinks every 5 seconds for ~1/4 second

    p5.push();

    if (this.currentAction === LadyFervieSprite.Action.Read) {
      this.handleReadAndBlinkAnimation(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Dance) {
      this.handleDanceAnimation(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Glow) {
      this.ladyGlow.draw(p5, this.x - 148, this.y - 40, 0.3);
    } else if (this.currentAction === LadyFervieSprite.Action.Neutral) {
      this.handleNeutralPose(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.RideFish) {
      this.handleRidingFishAnimation(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Walk) {
      this.ladyWalk.draw(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Swing) {
      this.ladySwing.draw(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Love) {
      this.handleLovePose(p5);
    }

    p5.pop();
  }

  getFootPositionX() {
    return this.x + ((LadyFervieSprite.UNSCALED_IMAGE_WIDTH/2 - 55)*0.3);
  }

  getFootPositionY() {
    return this.y + ((LadyFervieSprite.UNSCALED_IMAGE_HEIGHT/2 + 60)*0.3);
  }

  isOverLady(x, y) {
    let unscaledWidth = 283;
    let unscaledHeight = 330;
    let scale = 0.3;
    if (x < this.x || y < (this.y - 35)) {
      return false;
    }

    if (x > (this.x + unscaledWidth * scale) || y > (this.y - 35) + unscaledHeight * scale) {
      return false;
    }

    return true;
  }

  walkLeft(amount) {
    console.log("walk left!");
    this.ladyWalk.x = this.x;
    this.ladyWalk.y = this.y;
    this.currentAction = LadyFervieSprite.Action.Walk;
    this.ladyWalk.walkLeft(amount, this.setNeutralWhenDone);
  }

  walkRight(amount) {
    console.log("walk right!");
    this.ladyWalk.x = this.x;
    this.ladyWalk.y = this.y;
    this.currentAction = LadyFervieSprite.Action.Walk;
    this.ladyWalk.walkRight(amount, this.setNeutralWhenDone);
  }

  swing() {
    this.ladySwing.animationFrame = 1;
    this.currentAction = LadyFervieSprite.Action.Swing;
  }

  love() {
    this.heart.setPosition(this.x, this.y);
    this.currentAction = LadyFervieSprite.Action.Love;
  }

  setNeutralWhenDone = () => {
    console.log("setNeutralWhenDone");
    this.currentAction = LadyFervieSprite.Action.Neutral;
  }

  handleRidingFishAnimation(p5) {
    p5.translate(this.x + 50, this.y - 40);
    p5.scale(0.3, 0.3);

    let image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.RIDES_FISH);
    p5.image(image, 0, 0);
  }

  handleNeutralPose(p5) {
    p5.push();
    let scale = 0.3;
    p5.translate(this.x, this.y - 35);
    p5.scale(scale, scale);

    let image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_IMAGE);
    p5.image(image, 0, 0);
    p5.pop();
  }

  handleLovePose(p5) {
    p5.push();
    let scale = 0.3;
    p5.translate(this.x, this.y - 35);
    p5.scale(scale, scale);

    //1-115, 105-110 & 115-120 is blink

    let image = null;
    if (this.animationFrame < 109 || (this.animationFrame > 112 && this.animationFrame < 115) ) {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_IMAGE);
    } else {
      console.log("blink!");
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_BLINK_IMAGE);
    }
    p5.image(image, 0, 0);
    p5.pop();
    this.heart.draw(p5);
  }


  handleDanceAnimation(p5) {
    let image = null;
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
  }

  handleReadAndBlinkAnimation(p5) {
    let image;
    if (this.animationFrame < 115) {
      image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 1, this.size);
    } else {
      console.log("blink!");
      image = this.animationLoader.getAnimationImageWithManualFrame(p5, AnimationId.Animation.LadyFervie, 2, this.size);
    }

    p5.image(image, this.x, this.y);
  }

  isBetween(frame, frameLow, frameHigh) {
    return frame >= frameLow && frame <= frameHigh;
  }

  dance() {
    this.currentAction = LadyFervieSprite.Action.Dance;
  }

  neutral() {
    this.currentAction = LadyFervieSprite.Action.Neutral;
  }

  stopDancing() {
    this.currentAction = LadyFervieSprite.Action.Neutral;
  }

  ride(fishy) {
    this.currentAction = LadyFervieSprite.Action.RideFish;
    this.x = fishy.getAdjustedX();
    this.y = fishy.getAdjustedY();
    this.fishySprite = fishy;
  }

  dismount(x, y) {
    this.currentAction = LadyFervieSprite.Action.Neutral;
    this.fishySprite = null;
    this.x = x;
    this.y = y;
  }

  startGlow() {
    if (this.currentAction === LadyFervieSprite.Action.Dance || this.currentAction === LadyFervieSprite.Action.Neutral) {
      this.currentAction = LadyFervieSprite.Action.Glow;
      this.ladyGlow.startChanneling();
    }
  }

  stopGlow() {
    if (this.currentAction === LadyFervieSprite.Action.Glow) {
      this.ladyGlow.stopChanneling();
      this.currentAction = LadyFervieSprite.Action.Neutral
    }
  }

  isChanneling() {
    return this.ladyGlow.isChanneling;
  }

  isRidingFish() {
    return this.currentAction === LadyFervieSprite.Action.RideFish;
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

    if (this.currentAction === LadyFervieSprite.Action.RideFish && this.fishySprite) {
      this.x = this.fishySprite.getAdjustedX();
      this.y = this.fishySprite.getAdjustedY();
    }

    this.ladyGlow.update(p5, environment);
    this.ladyWalk.update(p5, environment);
    this.ladySwing.update(p5, environment);
    this.heart.update(p5, environment);

    if (this.currentAction === LadyFervieSprite.Action.Walk) {
      this.x = this.ladyWalk.getCurrentX();
      this.y = this.ladyWalk.getCurrentY();
    }
  }

}
