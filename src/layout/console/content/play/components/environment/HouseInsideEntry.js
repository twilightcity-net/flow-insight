/**
 * Creates our first inside house map, the entryway of the house
 */
import Environment from "./Environment";
import FervieSprite from "../fervie/FervieSprite";


export default class HouseInsideEntry extends Environment {


  static BACKGROUND_IMAGE = "./assets/animation/insidehouse/house_inside_entry_background.png";
  static WALK_AREA_IMAGE = "./assets/animation/insidehouse/house_inside_entry_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE ="./assets/animation/insidehouse/house_inside_entry_walkarea_behind.png";

  static WALK_BEHIND_WALL="./assets/animation/insidehouse/house_inside_entry_behindwall.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.BACKGROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_WALL);

    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_AREA_IMAGE);

    this.isGoingThroughDoor = false;

  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getNorthSpawnProperties() {
    return {x: Math.round((HouseInsideEntry.IMAGE_WIDTH / 2 - 50) * this.scaleAmountX),
      y: Math.round((HouseInsideEntry.IMAGE_HEIGHT - 220) * this.scaleAmountY)};
  }

  getSouthSpawnProperties() {
    return {x:Math.round(this.width / 2),
      y: Math.round((HouseInsideEntry.IMAGE_HEIGHT - 180) * this.scaleAmountY)};
  }

  getLeftSpawnProperties() {
    return {x: Math.round(150 * this.scaleAmountX),
      y: Math.round((HouseInsideEntry.IMAGE_HEIGHT - 200) * this.scaleAmountY)};
  }

  isValidPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }

  isWalkBehindPosition(p5 ,x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_AREA_IMAGE);

    let color = walkAreaImage.get(Math.round(x/this.scaleAmountX), Math.round(y/this.scaleAmountY));
    if (color && (color[0] > 0)) {
      return true;
    } else {
      return false;
    }
  }


  isFervieInFrontOfDoorway(fervie) {

    //between two points, 527 <=> 630 on x, 361 <=> 363 on y position

    let x = Math.round(fervie.getFervieFootX()/this.scaleAmountX);
    let y = Math.round(fervie.getFervieFootY()/this.scaleAmountY);

    if (fervie.getDirection() === FervieSprite.Direction.Up && x > 527 && x < 630 && y <= 363) {
      return true;
    }
    return false;
  }


  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.BACKGROUND_IMAGE);
    let wall = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_WALL);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let wall = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_WALL);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(wall, 0, 0)
    }
    p5.pop();
  }

  hasFervieMovingNorth(fervie) {
    return this.isGoingThroughDoor;
  }

  mousePressed(p5, fervie) {
    console.log("x = "+fervie.x + ", y = "+fervie.y);
    console.log("fx = "+fervie.getFervieFootX() + ", fy = "+fervie.getFervieFootY());

    //TODO click on paintings
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    if (this.isFervieInFrontOfDoorway(fervie)) {
      console.log("fervie going through door!");
      this.isGoingThroughDoor = true;
    } else {
      this.isGoingThroughDoor = false;
    }
  }

}
