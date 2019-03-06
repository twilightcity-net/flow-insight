import { DataModel } from "./DataModel";
import {SpiritModel} from "./SpiritModel";

export class AltMemberSpiritExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.xpSummary = null;
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
    this.teamModel = null;
  }

  setDependentModel(teamModel) {
    this.teamModel = teamModel;
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

    let memberStatus = this.teamModel.getMemberStatus(this.altMemberId);

    let xpSummaryDto = memberStatus.xpSummary;

    this.xpSummary = xpSummaryDto;
    this.level = xpSummaryDto.level;
    this.percentXP = Math.round(
      (xpSummaryDto.xpProgress / xpSummaryDto.xpRequiredToLevel) * 100
    );
    this.totalXP = xpSummaryDto.totalXP;
    this.title = xpSummaryDto.title;
    this.remainingToLevel = xpSummaryDto.xpRequiredToLevel;

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
