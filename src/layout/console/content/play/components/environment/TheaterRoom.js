/**
 * Creates our moovie theater environment in TC
 */
import Environment from "./Environment";
import GameState from "../hud/GameState";
import {TalkToClient} from "../../../../../../clients/TalkToClient";
import {RendererEventFactory} from "../../../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../../../clients/BaseClient";
import {ResourceCircuitController} from "../../../../../../controllers/ResourceCircuitController";
import {MemberClient} from "../../../../../../clients/MemberClient";
import {MoovieClient} from "../../../../../../clients/MoovieClient";

export default class TheaterRoom extends Environment {
  static GROUND_IMAGE = "./assets/animation/theater/theater_room_background.png";
  static CHAIRS_BACK_IMAGE = "./assets/animation/theater/theater_room_chairs_back.png";
  static CHAIRS_MID_IMAGE = "./assets/animation/theater/theater_room_chairs_mid.png";
  static CHAIRS_FRONT_IMAGE = "./assets/animation/theater/theater_room_chairs_front.png";
  static SHADOW_IMAGE = "./assets/animation/theater/theater_room_shadow.png";

  static WALK_AREA_IMAGE = "./assets/animation/theater/theater_room_walkarea.png";

  /**
   * Preload all the environment images, so they are cached and ready to display
   * @param p5
   */
  preload(p5) {
    super.preload(p5);
    this.animationLoader.getStaticImage(p5, TheaterRoom.GROUND_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_BACK_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);
    this.animationLoader.getStaticImage(p5, TheaterRoom.SHADOW_IMAGE);

    this.animationLoader.getStaticImage(p5, TheaterRoom.WALK_AREA_IMAGE);

    this.moovieId = this.globalHud.getGameStateProperty(GameState.Property.OPENED_MOVIE_ID);
    this.connectToRoom();

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
  }

  unload(p5) {
    super.unload(p5);
    console.log("unload");
    this.disconnectFromRoom();
    this.talkRoomMessageListener.clear();
  }

  connectToRoom() {
    if (this.moovieId) {
      MoovieClient.getMoovieCircuit(this.moovieId, this, (arg) => {
        if (!arg.error) {
          this.talkRoomId = arg.data.talkRoomId;
          TalkToClient.joinExistingRoom(this.talkRoomId, this, (arg) => {
            if (!arg.error) {
              console.log("room connected");
            } else {
              console.error("Unable to connect to room: "+arg.error);
            }
          });
        }
      });


    }
  }

  disconnectFromRoom() {
    if (this.talkRoomId) {
      TalkToClient.leaveExistingRoom(this.talkRoomId, this, (arg) => {
        if (!arg.error) {
          console.log("leaving room");
        } else {
          console.error("unable to leave room: " + arg.error);
        }

      });
    }
  }

  onTalkRoomMessage = (event, arg) => {
    console.log("messageType = "+arg.messageType);
  };

  getDefaultSpawnProperties() {
    return this.getSouthSpawnProperties();
  }


  getSouthSpawnProperties() {
    console.log("getSouthSpawnProperties");
    return {
      x: Math.round(50 * this.scaleAmountX),
      y: Math.round((Environment.IMAGE_HEIGHT - 150) * this.scaleAmountY),
      scale: 0.4
    };
  }

  isValidPosition(p5, x, y) {
    let walkAreaImage = this.animationLoader.getStaticImage(p5, TheaterRoom.WALK_AREA_IMAGE);
    return super.isWithinTargetArea(walkAreaImage, x, y);
  }

  /**
   * Draw the background environment on the screen
   * @param p5
   */
  drawBackground(p5, fervie) {

    fervie.adjustDown(20);

    let backgroundImage = this.animationLoader.getStaticImage(p5, TheaterRoom.GROUND_IMAGE);
    let chairsMid = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    let chairsFront = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    p5.image(backgroundImage, 0, 0);

    if (this.isBehindFrontRow(fervie)) {
      p5.image(chairsFront, 0, 0);
    }

    if (this.isBehindMiddleRow(fervie)) {
      p5.image(chairsMid, 0, 0);
    }

    const fervieRowNumber = this.getFervieRowNumber(fervie);
    if ((fervieRowNumber === 1 && this.isOverChairsFront(p5, p5.mouseX, p5.mouseY))
     || (fervieRowNumber === 2 && this.isOverChairsMid(p5, p5.mouseX, p5.mouseY))
      || (fervieRowNumber === 3 && this.isOverChairsBack(p5, p5.mouseX, p5.mouseY))) {
      this.globalHud.setIsActionableHover(true, false);
    } else {
      this.globalHud.setIsActionableHover(false, false);
    }

    // p5.textSize(18);
    // p5.textAlign(p5.CENTER);
    // p5.textFont('sans-serif');
    // p5.fill(255, 255, 255);
    // p5.text("Your Moovie is about to begin...", Environment.IMAGE_WIDTH/2 - 200, Environment.IMAGE_HEIGHT/2 - 60, 400, 80);

    p5.pop();
  }

  isOverChairsBack(p5, x, y) {
      let chairsImage = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_BACK_IMAGE);
      return this.isOverImage(chairsImage, x, y);
  }

  isOverChairsMid(p5, x, y) {
    let chairsImage = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    return this.isOverImage(chairsImage, x, y);
  }

  isOverChairsFront(p5, x, y) {
    let chairsImage = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);
    return this.isOverImage(chairsImage, x, y);
  }

  isOverChairRow(p5, rowNumber, x, y) {
    if (rowNumber === 1) {
      return this.isOverChairsFront(p5, x, y);
    } else if (rowNumber === 2) {
      return this.isOverChairsMid(p5, x, y);
    } else if (rowNumber === 3) {
      return this.isOverChairsBack(p5, x, y);
    }
  }

  isOverImage(image, x, y) {
    let color = image.get(
      Math.round(x / this.scaleAmountX),
      Math.round(y / this.scaleAmountY)
    );
    return !!(color && color[3] > 0);
  }

  getFervieRowNumber(fervie) {
    const adjustX = (fervie.getFervieFootX() / this.scaleAmountX);
    const adjustY = (fervie.getFervieFootY() / this.scaleAmountY);

    if (adjustX > 199 && adjustX < 1090 && adjustY > 396 && adjustY < 416) {
      return 1;
    }
    if (adjustX > 133 && adjustX < 1165 && adjustY > 427 && adjustY < 444) {
      return 2;
    }
    if (adjustX > 62 && adjustX < 1239 && adjustY > 453 && adjustY < 469) {
      return 3;
    }
    return 0;
  }

  getFervieNearestSeatNumber(rowNumber, fervie) {
    if (rowNumber === 0) {
      return 0;
    }

    let offset = 0;
    let rowWidth = 1;

    if (rowNumber === 1) {
      offset = 199;
      rowWidth = 891;
    } else if (rowNumber === 2) {
      offset = 133;
      rowWidth = 1032;
    } else if (rowNumber === 3) {
      offset = 62;
      rowWidth = 1177;
    }

    const adjustX = (fervie.getFervieFootX() / this.scaleAmountX);
    return Math.floor(((adjustX - offset) / rowWidth)*11);
  }

  getSitXY(fervie, rowNumber, seatInRow) {

    let offset = 0;
    let rowWidth = 1;
    let adjustedFootY = 0;

    if (rowNumber === 1) {
      offset = 191;
      rowWidth = 900;
      adjustedFootY = 410;
    } else if (rowNumber === 2) {
      offset = 123;
      rowWidth = 1042;
      adjustedFootY = 440;
    } else if (rowNumber === 3) {
      offset = 55;
      rowWidth = 1185;
      adjustedFootY = 464;
    }

    const seatWidth = (rowWidth / 11);
    let adjustedFootX = offset + (seatWidth * seatInRow) + (seatWidth/2);

    //okay these adjustedCoords, so we need to unadjust too.

    return [fervie.getXForFoot(adjustedFootX*this.scaleAmountX), fervie.getYForFoot(adjustedFootY*this.scaleAmountY)];
  }

  getSeatNumber(rowNumber, x) {
    if (rowNumber === 0) {
      return 0;
    }
    let adjustX = x / this.scaleAmountX;
    let offset = 0;
    let rowWidth = 1;

    if (rowNumber === 1) {
      offset = 199;
      rowWidth = 891;
    } else if (rowNumber === 2) {
      offset = 133;
      rowWidth = 1032;
    } else if (rowNumber === 3) {
      offset = 62;
      rowWidth = 1177;
    }

    return Math.floor(((adjustX - offset) / rowWidth)*11);
  }

  // front 199 1090
  // mid 133 (x) 1165
  // back 62 1239


  drawOverlay(p5, fervie) {
    let shadow = this.animationLoader.getStaticImage(p5, TheaterRoom.SHADOW_IMAGE);
    let chairsBack = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_BACK_IMAGE);
    let chairsMid = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_MID_IMAGE);
    let chairsFront = this.animationLoader.getStaticImage(p5, TheaterRoom.CHAIRS_FRONT_IMAGE);

    p5.push();
    p5.scale(this.scaleAmountX, this.scaleAmountY);

    if (!this.isBehindFrontRow(fervie)) {
      p5.image(chairsFront, 0, 0);
    }

    if (!this.isBehindMiddleRow(fervie)) {
      p5.image(chairsMid, 0, 0);
    }

    p5.image(chairsBack, 0, 0);
    p5.image(shadow, 0, 0);
    p5.pop();
  }

  isBehindFrontRow(fervie) {
    const adjustY = (fervie.getFervieFootY() / this.scaleAmountY);
    return adjustY > 420;
  }

  isBehindMiddleRow(fervie) {
    const adjustY = (fervie.getFervieFootY() / this.scaleAmountY);
    return adjustY > 450;
  }

  sitDown(fervie, rowNumber, seatInRow) {
    console.log("sit ["+rowNumber + ", "+seatInRow + "]");

    const sitPosition = this.getSitXY(fervie, rowNumber, seatInRow);
    fervie.x = sitPosition[0];
    fervie.y = sitPosition[1];
    fervie.sit();
  }

  mousePressed(p5, fervie) {
    console.log((fervie.getFervieFootY() / this.scaleAmountY));

    const rowNumber = this.getFervieRowNumber(fervie);
    if (rowNumber > 0) {
      const seatNum = this.getSeatNumber(rowNumber, p5.mouseX);
      const fervieSeat = this.getFervieNearestSeatNumber(rowNumber, fervie);

      if (!fervie.isSitting && Math.abs(seatNum - fervieSeat) <= 1) {
        this.sitDown(fervie, rowNumber, seatNum);
      } else if (fervie.isSitting && this.isOverChairRow(p5, rowNumber, p5.mouseX, p5.mouseY)) {
        fervie.stand();
      }
    }
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    super.update(p5);
  }
}
