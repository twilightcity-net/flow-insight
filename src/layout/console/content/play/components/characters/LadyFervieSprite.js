import AnimationId from "../AnimationId";
import LadyGlowSprite from "./LadyGlowSprite";
import LadyWalkSprite from "./LadyWalkSprite";
import LadySwingSprite from "./LadySwingSprite";
import HeartSprite from "./HeartSprite";
import FervieSprite from "../fervie/FervieSprite";

/**
 * Creates our fervie sprite animation
 */

export default class LadyFervieSprite {
  constructor(animationLoader, x, y, size, scale) {
    this.animationLoader = animationLoader;
    this.x = x - size / 2 - 10;
    this.y = y - 20;
    this.size = size; //svg size
    this.scale = scale; //pixel scale
    this.animationFrame = 1;

    this.currentAction = LadyFervieSprite.Action.Read;

    this.fishySprite = null;
    this.isVisible = true;
    this.isMirror = false;

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
  static NEUTRAL_BLINK_IMAGE = "./assets/animation/fervie/fervie_lady_neutral_blink.png";
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
    this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_BLINK_IMAGE);
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
    if (!this.isVisible) {
      return;
    }
    //24 frames per second, blinks every 5 seconds for ~1/4 second

    p5.push();

    if (this.currentAction === LadyFervieSprite.Action.Read) {
      this.handleReadAndBlinkAnimation(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Dance) {
      this.handleDanceAnimation(p5);
    } else if (this.currentAction === LadyFervieSprite.Action.Glow) {
      this.ladyGlow.draw(p5, this.x - 148, this.y - 40, this.scale);
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
    return this.x + ((LadyFervieSprite.UNSCALED_IMAGE_WIDTH/2 - 55)*this.scale);
  }

  getFootPositionY() {
    return this.y + ((LadyFervieSprite.UNSCALED_IMAGE_HEIGHT/2 + 60)*this.scale);
  }

  isFervieBehindLady(fervie) {
    return fervie.getFervieFootY()+20 < this.getFootPositionY();
  }

  isNextToLadyOnRight(fervie) {
    let xDiff = this.getFootPositionX() - fervie.getFervieFootX();  //we want lady to be the left
    let yDiff = this.getFootPositionY() - fervie.getFervieFootY();

    return xDiff > -25 && xDiff < -20 && yDiff > 7 && yDiff < 22 && !this.isFervieBehindLady(fervie);
  }

  isNextToLadyOnLeft(fervie) {
    let xDiff = this.getFootPositionX() - fervie.getFervieFootX();  //we want lady to be the right
    let yDiff = this.getFootPositionY() - fervie.getFervieFootY();

    console.log("xDiff = "+xDiff + ", yDiff = "+yDiff);
    return xDiff > 140 && xDiff < 170 && yDiff > 1 && yDiff < 15 && !this.isFervieBehindLady(fervie);
  }

  isOverLady(x, y) {
    let unscaledWidth = 283;
    let unscaledHeight = 330;
    let scale = this.scale;
    if (x < this.x || y < (this.y - 35)) {
      return false;
    }

    if (x > (this.x + unscaledWidth * scale) || y > (this.y - 35) + unscaledHeight * scale) {
      return false;
    }

    return true;
  }


  isCollidingWithLady(direction, x, y) {
      let ladyX = this.getFootPositionX();
      let ladyY = this.getFootPositionY() - 10;

      let isWithinY = ((y < ladyY && (ladyY - y) < 20) || (y > ladyY && (y - ladyY) < 10) );

      if (isWithinY && direction === FervieSprite.Direction.Left && x > ladyX && (x - ladyX) < 20) {
        return true;
      }
      if (isWithinY && direction === FervieSprite.Direction.Right && x < ladyX && (ladyX - x) < 90) {
        return true;
      }

      if (isWithinY && (direction === FervieSprite.Direction.Up || direction === FervieSprite.Direction.Down)) {
        if ((x > ladyX && (x - ladyX) < 20) || ( x < ladyX && (ladyX - x) < 90)) {
          return true;
        }
      }

    return false;
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

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  swing() {
    this.ladySwing.animationFrame = 1;
    this.currentAction = LadyFervieSprite.Action.Swing;
  }

  love() {
    this.heart.setPosition(this.x + (283/2)*this.scale, this.y);
    this.heart.reset();
    this.currentAction = LadyFervieSprite.Action.Love;
    this.isMirror = false;
  }

  loveMirror() {
    this.heart.setPosition(this.x + (283/2)*this.scale, this.y);
    this.heart.reset();
    this.currentAction = LadyFervieSprite.Action.Love;
    this.isMirror = true;
  }

  setNeutralWhenDone = () => {
    console.log("setNeutralWhenDone");
    this.currentAction = LadyFervieSprite.Action.Neutral;
  }

  handleRidingFishAnimation(p5) {
    p5.translate(this.x + 50, this.y - 40);
    p5.scale(this.scale, this.scale);

    let image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.RIDES_FISH);
    p5.image(image, 0, 0);
  }

  handleNeutralPose(p5) {
    p5.push();
    let scale = this.scale;
    p5.translate(this.x, this.y - 35);
    p5.scale(scale, scale);

    let image = null;
    if (this.animationFrame < 115) {
      image =  this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_IMAGE);
    } else {
      console.log("blink!");
      image =  this.animationLoader.getStaticImage(p5, LadyFervieSprite.NEUTRAL_BLINK_IMAGE);
    }

    p5.image(image, 0, 0);
    p5.pop();
  }

  handleLovePose(p5) {
    p5.push();
    let scale = this.scale;


    if (this.isMirror) {
      p5.translate(this.x , this.y - 35);
      p5.scale(scale, scale);
      p5.scale(-1, 1);
      p5.translate(-283 , 0);
    } else {
      p5.translate(this.x, this.y - 35);
      p5.scale(scale, scale);
    }

    //1-115, 105-110 & 115-120 is blink

    let image = null;
    if (this.animationFrame < 109 || (this.animationFrame > 112 && this.animationFrame < 115) ) {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_IMAGE);
    } else {
      image = this.animationLoader.getStaticImage(p5, LadyFervieSprite.LOVE_BLINK_IMAGE);
    }
    p5.image(image, 0, 0);
    p5.pop();
    this.heart.draw(p5);
  }


  handleDanceAnimation(p5) {
    let image = null;
    p5.translate(this.x, this.y - 35);
    p5.scale(this.scale, this.scale);

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

  setVisible(flag) {
    this.isVisible = flag;
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
