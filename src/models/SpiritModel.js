import { DataModel } from "./DataModel";

const { remote } = window.require("electron"),
  XPSummaryDto = remote.require("./dto/XPSummaryDto");

export class SpiritModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.xpSummary = null;

    this.xpSummary = null;
    this.level = 0;
    this.percentXP = 99;
    this.totalXP = 99999;
    this.title = "";

    this.isDirty = false;
    this.dirtyFlame = 0;
    this.originalFlame = 0;
    this.activeFlameRating = 0;
  }

  static get CallbackEvent() {
    return {
      XP_UPDATE: "spirit-xp-update",
      RESET_FLAME: "spirit-reset-flame",
      DIRTY_FLAME_UPDATE: "spirit-dirty-flame"
    };
  }

  /**
   * Refreshes the current XP from the server
   */
  refreshXP = () => {
    let remoteUrn = "/spirit/xp";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      XPSummaryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshXPCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Reinitializes the Torchie flame to a specified rating
   */
  resetFlame = cleanFlameRating => {
    let initFlame = 0;
    if (cleanFlameRating) {
      initFlame = cleanFlameRating;
    }

    this.isDirty = false;
    this.dirtyFlame = null;
    this.originalFlame = initFlame;
    this.activeFlameRating = initFlame;

    this.notifyListeners(SpiritModel.CallbackEvent.RESET_FLAME);
  };

  /**
   * Changes the active flame rating by pushing the +1/-1 flame buttons
   */
  adjustFlame = flameDelta => {
    this.isDirty = true;
    this.dirtyFlame = this.calculateNewRating(
      this.activeFlameRating,
      flameDelta
    );
    this.activeFlameRating = this.dirtyFlame;

    this.notifyListeners(SpiritModel.CallbackEvent.DIRTY_FLAME_UPDATE);
  };

  calculateNewRating = (currentFlame, flameDelta) => {
    let flameRating = 0;
    if (currentFlame) {
      flameRating = Number(currentFlame);
    }
    if (flameDelta) {
      flameRating = flameRating + Number(flameDelta);
    }

    if (flameRating > 5) {
      flameRating = 5;
    } else if (flameRating < -5) {
      flameRating = -5;
    }

    if (currentFlame > 0 && flameDelta < 0) {
      flameRating = 0;
    }

    if (currentFlame < 0 && flameDelta > 0) {
      flameRating = 0;
    }
    return flameRating;
  };

  onRefreshXPCb = (xpSummaryDto, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      this.xpSummary = xpSummaryDto;
      this.level = xpSummaryDto.level;
      this.percentXP = Math.round(
        (xpSummaryDto.xpProgress / xpSummaryDto.xpRequiredToLevel) * 100
      );
      this.totalXP = xpSummaryDto.totalXP;
      this.title = xpSummaryDto.title;
    }
    this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
  };
}
