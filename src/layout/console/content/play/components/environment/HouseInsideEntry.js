/**
 * Creates our first inside house map, the entryway of the house
 */
import Environment from "./Environment";
import FervieSprite from "../fervie/FervieSprite";
import LadyFervieSprite from "../characters/LadyFervieSprite";
import GameState from "../hud/GameState";

export default class HouseInsideEntry extends Environment {
  static BACKGROUND_IMAGE =
    "./assets/animation/insidehouse/house_inside_entry_background.png";
  static WALK_AREA_IMAGE =
    "./assets/animation/insidehouse/house_inside_entry_walkarea.png";
  static WALK_BEHIND_AREA_IMAGE =
    "./assets/animation/insidehouse/house_inside_entry_walkarea_behind.png";

  static WALK_BEHIND_WALL =
    "./assets/animation/insidehouse/house_inside_entry_behindwall.png";
  static CLICKABLE_AREA =
    "./assets/animation/insidehouse/house_inside_entry_clickable.png";

  static WALL_ART_0 =
    "./assets/animation/insidehouse/house_inside_entry_wallart0.png";
  static WALL_ART_1 =
    "./assets/animation/insidehouse/house_inside_entry_wallart1.png";
  static WALL_ART_2 =
    "./assets/animation/insidehouse/house_inside_entry_wallart2.png";
  static WALL_ART_3 =
    "./assets/animation/insidehouse/house_inside_entry_wallart3.png";

  constructor(animationLoader, width, height, globalHud) {
    super(animationLoader, width, height, globalHud);

    this.ladyFervieSprite = new LadyFervieSprite(this.animationLoader, 800, 300, 200, 0.45);
  }
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
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.CLICKABLE_AREA);

    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_0);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_1);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_2);
    this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_3);

    this.ladyFervieSprite.preload(p5);

    this.isLadyVisible = this.globalHud.getGameStateProperty(GameState.Property.IS_LADY_KISSED) &&
      !this.globalHud.getGameStateProperty(GameState.Property.HAS_ENTERED_BEDROOM);

    if (this.isLadyVisible) {
      this.ladyFervieSprite.setVisible(true);
      this.ladyFervieSprite.setPosition(800, 300);
      this.playIntroAnimation();
    } else {
      this.ladyFervieSprite.setVisible(false);
    }

    this.isGoingThroughDoor = false;
    this.showWallArt = false;
    this.wallArtIndex = 0;
  }

  playIntroAnimation() {
    this.ladyFervieSprite.neutral();

    setTimeout(() => {
      this.ladyFervieSprite.dance();

      setTimeout(() => {
        this.ladyFervieSprite.loveMirror();

        setTimeout(() => {
          this.ladyFervieSprite.walkLeft(180, () => {
            this.ladyFervieSprite.walkUp(30, () => {
              this.ladyFervieSprite.setVisible(false);
              this.globalHud.setGameStateProperty(GameState.Property.HAS_ENTERED_BEDROOM, true);
            });
          });

        }, 3000);
      }, 3000);
    }, 2000);
  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getNorthSpawnProperties() {
    return {
      x: Math.round(
        (HouseInsideEntry.IMAGE_WIDTH / 2 - 50) *
          this.scaleAmountX
      ),
      y: Math.round(
        (HouseInsideEntry.IMAGE_HEIGHT - 220) *
          this.scaleAmountY
      ),
    };
  }

  getSouthSpawnProperties() {
    return {
      x: Math.round(this.width / 2),
      y: Math.round(
        (HouseInsideEntry.IMAGE_HEIGHT - 180) *
          this.scaleAmountY
      ),
    };
  }

  getLeftSpawnProperties() {
    return {
      x: Math.round(150 * this.scaleAmountX),
      y: Math.round(
        (HouseInsideEntry.IMAGE_HEIGHT - 200) *
          this.scaleAmountY
      ),
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_AREA_IMAGE);

    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_AREA_IMAGE);

    return super.isWithinTargetArea(walkAreaImage, x, y);

  }

  isOverWallArtPosition(p5, x, y) {
    let clickMapImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.CLICKABLE_AREA);

    return super.isWithinTargetArea(clickMapImage, x, y);
  }

  isOverWallArtPopup(p5, x, y) {
    let wallArtPopupImage = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_0);

    let color = wallArtPopupImage.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    if (color && color[3] > 0) {
      return true;
    } else {
      return false;
    }
  }

  isOverLady(x, y) {
    return this.ladyFervieSprite.isOverLady(this.getScaledX(x), this.getScaledY(y));
  }

  getWallArtIndexBasedOnPosition(x, y) {
    if (x > 400 && x < 827) {
      return 1;
    } else if (x > 827 && x < 930) {
      return 2;
    } else if (x > 930) {
      return 3;
    } else {
      return 0;
    }
  }

  isFervieInFrontOfDoorway(fervie) {
    //between two points, 527 <=> 630 on x, 361 <=> 363 on y position

    let x = Math.round(fervie.getFervieFootX() / this.scaleAmountX);
    let y = Math.round(fervie.getFervieFootY() / this.scaleAmountY);

    if (
      fervie.getDirection() === FervieSprite.Direction.Up &&
      x > 527 &&
      x < 630 &&
      y <= 363
    ) {
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

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if ((!this.showWallArt && this.isOverWallArtPosition(p5, p5.mouseX, p5.mouseY)) ||
      (this.showWallArt && !this.isOverWallArtPopup(p5, p5.mouseX, p5.mouseY))
    || this.isOverLady(p5.mouseX, p5.mouseY)) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    if (!this.ladyFervieSprite.isFervieBehindLady(fervie, this.scaleAmountX, this.scaleAmountY)) {
      this.ladyFervieSprite.draw(p5);
    }

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let wall = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALK_BEHIND_WALL);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      p5.image(wall, 0, 0);
    }

    if (this.showWallArt) {
      this.drawWallArt(p5, this.wallArtIndex);
    }

    if (this.ladyFervieSprite.isFervieBehindLady(fervie, this.scaleAmountY, this.scaleAmountY)) {
      this.ladyFervieSprite.draw(p5);
    }

    p5.pop();
  }

  drawWallArt(p5, wallArtIndex) {
    console.log("Draw wall art " + wallArtIndex);

    let wallArt = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_0);
    if (wallArtIndex === 1) {
      wallArt = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_1);
    } else if (wallArtIndex === 2) {
      wallArt = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_2);
    } else if (wallArtIndex === 3) {
      wallArt = this.animationLoader.getStaticImage(p5, HouseInsideEntry.WALL_ART_3);
    }

    p5.image(wallArt, 0, 0);
  }

  isColliding(direction, fervieFootX, fervieFootY) {
    return (this.ladyFervieSprite.isCollidingWithLady(direction, fervieFootX, fervieFootY, this.scaleAmountX, this.scaleAmountY));
  }

  hasFervieMovingNorth(fervie) {
    return this.isGoingThroughDoor;
  }

  mousePressed(p5, fervie) {

    let x = p5.mouseX;
    let y = p5.mouseY;

    if (!this.showWallArt && this.isOverWallArtPosition(p5, x, y)) {
      this.wallArtIndex = this.getWallArtIndexBasedOnPosition(x, y);
      this.showWallArt = true;
    } else if (this.showWallArt && !this.isOverWallArtPopup(p5, x, y)) {
      this.showWallArt = false;
    }

    if (this.isOverLady(x, y) && this.ladyFervieSprite.isNextToLady(fervie, this.scaleAmountX, this.scaleAmountY)) {
      fervie.kissMirror();
    }
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

    this.ladyFervieSprite.update(p5);
  }
}
