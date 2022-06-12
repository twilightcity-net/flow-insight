import React from "react";
import FervieColors from "../../../support/FervieColors";
import AnimationId from "../AnimationId";
import {Sunglasses} from "./Sunglasses";
import FervieSprite from "../fervie/FervieSprite";

/**
 * Creates an overlay image of sunglasses that can be placed on top of
 * a walking fervie animation.  Takes a base image, then handles the position
 * adjustments for the subsequent frames so the sunglasses look like they are
 * being worn.
 */

export default class AccessoryManager {


//  56,62,61,54, 46,47, 55, 63, 63, 54, 47, 46
  //  55,64,64,55, 51,50, 54, 64, 65, 55, 50, 50

  static headPinSideAdjustY = [0,4,3,-2,-7, -6, -1, 4, 4, -1, -7, -6];
  static headPinDownAdjustY = [0,7,7,0,-2, -2, 1, 7, 8, 0, -3, -3];


  constructor(member, animationLoader) {
    this.member = member;
    this.animationLoader = animationLoader;

    this.sunglasses = new Sunglasses();
  }

  static get Accessory() {
    return {
      SUNGLASSES: "SUNGLASSES",
      HEARTGLASSES: "HEARTGLASSES"
    }
  }

  updateMember(member) {
    this.member = member;
  }

  preload(p5, size) {
    if (this.member.fervieAccessory === AccessoryManager.Accessory.SUNGLASSES) {
      this.animationLoader.getScaledSvgImage(p5, AnimationId.Accessory.SunglassRight, size);
      this.animationLoader.getScaledSvgImage(p5, AnimationId.Accessory.SunglassDown, size);
    }
    if (this.member.fervieAccessory === AccessoryManager.Accessory.HEARTGLASSES) {
      this.animationLoader.getScaledSvgImage(p5, AnimationId.Accessory.HeartglassRight, size);
      this.animationLoader.getScaledSvgImage(p5, AnimationId.Accessory.HeartglassDown, size);
    }
  }

  reloadImages(p5, size){
    this.animationLoader.clearScaledSvgCache(AnimationId.Accessory.SunglassRight);
    this.animationLoader.clearScaledSvgCache(AnimationId.Accessory.SunglassDown);
    this.animationLoader.clearScaledSvgCache(AnimationId.Accessory.HeartglassRight);
    this.animationLoader.clearScaledSvgCache(AnimationId.Accessory.HeartglassDown);

    this.preload(p5, size);
  }

  getAccessoryWithXY(p5, frameOn24, size, direction) {
    let image = null;

    image = this.getSunglassesForDirection(p5, size, direction);

    if (image) {
      const frameOn12 = AnimationId.getFrameOnTwos(frameOn24);

      const x = this.getXPositionForFrame(frameOn12, direction);
      const y = this.getYPositionForFrame(frameOn12, direction);
      return {image: image, x: x, y: y}
    }

    return null;
  }

  getSunglassesForDirection(p5, size, direction) {
    let animationId = null;

    if (direction === FervieSprite.Direction.Left || direction === FervieSprite.Direction.Right ) {
      if (this.member.fervieAccessory === AccessoryManager.Accessory.SUNGLASSES) {
         animationId = AnimationId.Accessory.SunglassRight;
      } else if (this.member.fervieAccessory === AccessoryManager.Accessory.HEARTGLASSES) {
        animationId = AnimationId.Accessory.HeartglassRight;
      }
    } else if (direction === FervieSprite.Direction.Down) {
      if (this.member.fervieAccessory === AccessoryManager.Accessory.SUNGLASSES) {
        animationId = AnimationId.Accessory.SunglassDown;
      } else if (this.member.fervieAccessory === AccessoryManager.Accessory.HEARTGLASSES) {
        animationId = AnimationId.Accessory.HeartglassDown;
      }
    }

    if (animationId) {
      return this.animationLoader.getScaledSvgImage(p5, animationId, size);
    }

    return null;
  }

  getXPositionForFrame(frameOn12, direction) {
    return 0;
  }

  getYPositionForFrame(frameOn12, direction) {
    if (direction === FervieSprite.Direction.Left || direction === FervieSprite.Direction.Right) {
      return AccessoryManager.headPinSideAdjustY[frameOn12 - 1];
    } else {
      return AccessoryManager.headPinDownAdjustY[frameOn12 - 1];
    }
  }

}
