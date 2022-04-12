/**
 * Creates our inside house map, the bedroom inside the house
 */
import Environment from "./Environment";
import MoovieFervieSprite from "../characters/MoovieFervieSprite";


export default class HouseInsideBedroom extends Environment {


  static BACKGROUND_IMAGE = "./assets/animation/insidehouse/house_inside_bedroom_background.png";
  static WALK_BEHIND_ITEMS="./assets/animation/insidehouse/house_inside_bedroom_walkbehind.png";

  static WALK_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_bedroom_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE ="./assets/animation/insidehouse/house_inside_bedroom_walkarea_behind.png";
  static FIREPLACE_GIF ="./assets/animation/insidehouse/fire.gif";

  static CHAIR_OVERLAY = "./assets/animation/insidehouse/house_inside_bedroom_chairarm.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.BACKGROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_BEHIND_ITEMS);

    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_BEHIND_AREA_IMAGE);

    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.FIREPLACE_GIF);
    this.animationLoader.getStaticImage(p5, HouseInsideBedroom.CHAIR_OVERLAY);

    this.moovieFervieSprite = new MoovieFervieSprite(
      this.animationLoader,
      500,
      Math.round(HouseInsideBedroom.IMAGE_HEIGHT / 2 + 43),
      150);

    this.moovieFervieSprite.preload(p5);
  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getSouthSpawnProperties() {
    return {x:Math.round(this.width / 2), y:
        Math.round((HouseInsideBedroom.IMAGE_HEIGHT - 180) * this.scaleAmountY)};
  }

  isValidPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_BEHIND_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
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
    let backgroundImage = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.BACKGROUND_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);
    this.drawFire(p5);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let walkBehindItems = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.WALK_BEHIND_ITEMS);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(walkBehindItems, 0, 0)
    }

    if (this.isFervieSittingDown(p5, fervie)) {
      fervie.hide();
      this.moovieFervieSprite.draw(p5);

      let chairArm = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.CHAIR_OVERLAY);
      p5.image(chairArm, 0, 0);
    }

    p5.pop();
  }

  isFervieSittingDown(p5, fervie) {
    return false;
  }

  drawFire(p5) {
    let fireImage = this.animationLoader.getStaticImage(p5, HouseInsideBedroom.FIREPLACE_GIF);
    p5.image(fireImage, 716, 285);
  }

  mousePressed(p5, fervie) {
    //click on bed
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.moovieFervieSprite.update(p5);
  }

}
