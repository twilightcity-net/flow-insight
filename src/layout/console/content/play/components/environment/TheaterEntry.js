/**
 * Creates our moovie theater inside entry environment in TC
 */
import Environment from "./Environment";
import GameState from "../hud/GameState";
import ConciergeCowSprite from "../characters/ConciergeCowSprite";
import YummiesCowSprite from "../characters/YummiesCowSprite";
import Fervie from "../fervie/FervieSprite";

export default class TheaterEntry extends Environment {
  static GROUND_IMAGE = "./assets/animation/theater/theater_entry_background.png";
  static FOREGROUND_IMAGE = "./assets/animation/theater/theater_entry_foreground.png";
  static WALK_AREA_IMAGE = "./assets/animation/theater/theater_entry_walkarea.png";
  static WALK_BEHIND_IMAGE = "./assets/animation/theater/theater_entry_walkbehind.png";
  static PORTAL_GIF = "./assets/animation/theater/theater_portal.gif";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, TheaterEntry.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterEntry.FOREGROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterEntry.WALK_AREA_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterEntry.WALK_BEHIND_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterEntry.PORTAL_GIF);

    this.conciergeCow = new ConciergeCowSprite(this.animationLoader, 10, 230 , 0.35);
    this.conciergeCow.preload(p5);

    this.yummiesCow = new YummiesCowSprite(this.animationLoader, Environment.IMAGE_WIDTH - 150, 177, 0.4);
    this.yummiesCow.preload(p5);

    this.lastMovieId = null;
    this.portalDoorNumber = 0;
    this.doorAlpha = 0;
    this.doorAlphaRate = 0.04;

    this.hasFervieGoingInPortal = false;

    this.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, null);
    console.log("preload!");

    this.globalHud.reloadStore(p5);
  }

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getSouthSpawnProperties() {
    console.log("getSouthSpawnProperties");
    return {
      x: Math.round(Environment.IMAGE_WIDTH/2 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 160) * this.scaleAmountY),
      scale: 0.6
    };
  }

  getNorthSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getLeftSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  getRightSpawnProperties() {
    return this.getSouthSpawnProperties();
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, TheaterEntry.WALK_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  isWalkBehindPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, TheaterEntry.WALK_BEHIND_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {
    let backgroundImage = this.animationLoader.getStaticImage(p5, TheaterEntry.GROUND_IMAGE);
    let foreground = this.animationLoader.getStaticImage(p5, TheaterEntry.FOREGROUND_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    this.drawPortalDoor(p5, this.portalDoorNumber);

    if (!this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      this.conciergeCow.draw(p5, fervie, this);
      p5.image(foreground, 0, 0);
    }

    if ((!this.globalHud.getMooviePickerOpen() && this.isOverConciergeCow(p5))
      || (!this.globalHud.getStoreOpen() && this.isOverYummiesCow(p5))) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    p5.pop();
  }

  drawOverlay(p5, fervie) {
    let foreground = this.animationLoader.getStaticImage(p5, TheaterEntry.FOREGROUND_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (this.isWalkBehindPosition(p5, fervie.getFervieFootX(), fervie.getFervieFootY())) {
      this.conciergeCow.draw(p5, fervie, this);
      p5.image(foreground, 0, 0);
    }

    this.yummiesCow.draw(p5, fervie, this);
    p5.pop();
  }

  drawPortalDoor(p5, doorNumber) {
    if (doorNumber === 0) {
      return;
    }

    p5.push();

    if (doorNumber === 1) {
      p5.translate(75, 147);
    } else if (doorNumber === 2) {
      p5.translate(247, 147);
    } else if (doorNumber === 3) {
      p5.translate(412, 147);
    }

    p5.fill("rgba(0,0,0,"+this.doorAlpha +")");
    p5.noStroke();
    p5.rect(30, 22, 135, 185);
    p5.scale(0.5, 0.5);
    p5.blendMode(p5.ADD);
    p5.tint(255,255 * this.doorAlpha);
    let portal = this.animationLoader.getStaticImage(p5, TheaterEntry.PORTAL_GIF);
    p5.image(portal, 0, 0);

    p5.pop();
  }

  isOverConciergeCow(p5) {
    const adjustX = p5.mouseX / this.scaleAmountX;
    const adjustY = p5.mouseY / this.scaleAmountY;

    return (adjustX > 15 && adjustX < 123 && adjustY > 234 && adjustY < 337);
  }

  isOverYummiesCow(p5) {
    const adjustX = p5.mouseX / this.scaleAmountX;
    const adjustY = p5.mouseY / this.scaleAmountY;

    return (adjustX > 1145 && adjustX < 1245 && adjustY > 182 && adjustY < 302);
  }

  isNextToYummiesCow(fervie) {
    const adjustX = fervie.getFervieFootX() / this.scaleAmountX;
    const adjustY = fervie.getFervieFootY() / this.scaleAmountY;

    return (adjustX > 800 && adjustY > 200);
  }

  isNextToConciergeCow(fervie) {
    const adjustX = fervie.getFervieFootX() / this.scaleAmountX;
    const adjustY = fervie.getFervieFootY() / this.scaleAmountY;

    return (adjustX < 400 && adjustY > 400);
  }


  hasFervieMovingNorth(fervie) {
    return this.hasFervieGoingInPortal;
  }

  isWalkingThroughPortalDoor(fervie) {

    if (fervie.getDirection() === Fervie.Direction.Up ) {
      const adjustX = fervie.getFervieFootX() / this.scaleAmountX;
      const adjustY = fervie.getFervieFootY() / this.scaleAmountY;

      if (adjustY < 370 && ((this.portalDoorNumber === 1 && adjustX > 130 && adjustX < 222)
        || (this.portalDoorNumber === 2 && adjustX > 290 && adjustX < 400)
        || (this.portalDoorNumber === 3 && adjustX > 445 && adjustX < 570))) {
        return true;
      }
    }
  }

  mousePressed(p5, fervie) {

    const adjustX = fervie.getFervieFootX() / this.scaleAmountX;
    const adjustY = fervie.getFervieFootY() / this.scaleAmountY;

    console.log("adjustX = "+adjustX);
    console.log("adjustX = "+adjustY);

    if (!this.globalHud.getMooviePickerOpen() && this.isOverConciergeCow(p5) && this.isNextToConciergeCow(fervie)) {
      console.log("yes moo!");
      this.globalHud.closeStore();
      this.globalHud.openMooviePicker();
    }
    if (!this.globalHud.getStoreOpen() && this.isOverYummiesCow(p5) && this.isNextToYummiesCow(fervie)) {
      console.log("yes!");
      this.globalHud.closeMooviePicker();
      this.globalHud.openStore();
    }

  }

  changeRandomPortal(p5) {
    let random = Math.floor(p5.random(3)) + 1; //1, 2, 3
    if (random !== this.portalDoorNumber) {
      return random;
    } else {
      return (random + 1) % 3 + 1;
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);

    this.conciergeCow.update(p5, this);
    this.yummiesCow.update(p5, this);

    if (this.globalHud.getStoreOpen() && !this.isNextToYummiesCow(fervie)) {
      this.globalHud.closeStore();
    }

    if (this.globalHud.getMooviePickerOpen() && !this.isNextToConciergeCow(fervie)) {
      this.globalHud.closeMooviePicker();
    }

    if (this.doorAlpha < 1) {
      this.doorAlpha += this.doorAlphaRate;
      if (this.doorAlpha > 1) {
        this.doorAlpha = 1;
      }
    }

    const openedMovieId = this.globalHud.getGameStateProperty(GameState.Property.OPENED_MOVIE_ID);
    if (openedMovieId && this.lastMovieId !== openedMovieId) {
      this.lastMovieId = openedMovieId;
      this.portalDoorNumber = this.changeRandomPortal(p5);
      this.doorAlpha = 0;
    }

    if (this.portalDoorNumber > 0 && this.isWalkingThroughPortalDoor(fervie)) {
      this.hasFervieGoingInPortal = true;
    }
  }
}
