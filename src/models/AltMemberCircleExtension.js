import { DataModel } from "./DataModel";

export class AltMemberCircleExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.name = "[AltMemberCircleExtension]";

    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
    this.allFeedMessages = [];
    this.problemDescription = "";
    this.circleName = "";
    this.hypercoreFeedId = null;
    this.hypercorePublicKey = null;
    this.hypercoreSecretKey = null;

    this.altMemberId = null;
  }

  setMemberSelection(memberId) {
    this.altMemberId = memberId;
    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
  }

  setDependentModel(teamModel) {
    this.teamModel = teamModel;
  }

  getCircleOwner = () => {
    return this.teamModel.getMemberStatus(this.altMemberId).shortName;
  };

  /**
   * Retrieves true if this member is already loaded
   */
  isMemberLoaded(memberId) {
    return this.altMemberId != null && this.altMemberId === memberId;
  }
}
