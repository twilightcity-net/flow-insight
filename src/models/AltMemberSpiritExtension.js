import { DataModel } from "./DataModel";
import {SpiritModel} from "./SpiritModel";

const { remote } = window.require("electron"),
  SpiritDto = remote.require("./dto/SpiritDto");

export class AltMemberSpiritExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.xpSummary = null;
    this.activeSpiritLinks = null;
    this.spiritId = null;

    this.level = 0;
    this.percentXP = 99;
    this.totalXP = 99999;
    this.title = "";

    this.isDirty = false;
    this.dirtyFlame = 0;
    this.originalFlame = 0;
    this.activeFlameRating = 0;
    this.remainingToLevel = 0;

    this.altMemberId = null;
  }


  setMemberSelection(memberId) {
    this.altMemberId = memberId;
  }

  /**
   * Retrieves true if this member is already loaded
   */
  isMemberLoaded(memberId) {
    return this.altMemberId != null && this.altMemberId === memberId;
  }

  /**
   * Refreshes the current XP from the latest member status
   */
  refreshXP = () => {

    let remoteUrn = "/spirit/"+this.altMemberId;
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      SpiritDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshFriendSpiritCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  onRefreshFriendSpiritCb = (spiritDto, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      this.xpSummary = spiritDto.xpSummary;
      if (spiritDto.activeSpiritLinks) {
        this.activeSpiritLinks = spiritDto.activeSpiritLinks.spiritLinks;
      } else {
        this.activeSpiritLinks = [];
      }
      this.spiritId = spiritDto.spiritId;
      this.level = this.xpSummary .level;
      this.percentXP = Math.round(
        (this.xpSummary.xpProgress / this.xpSummary.xpRequiredToLevel) * 100
      );
      this.totalXP = this.xpSummary.totalXP;
      this.title = this.xpSummary.title;
      this.remainingToLevel = this.xpSummary.xpRequiredToLevel - this.xpSummary.xpProgress;

    }
    this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
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


}
