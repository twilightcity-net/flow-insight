import { DataModel } from "./DataModel";
import {AltModelDelegate} from "./AltModelDelegate";
import {AltMemberSpiritExtension} from "./AltMemberSpiritExtension";

const { remote } = window.require("electron"),
  SpiritDto = remote.require("./dto/SpiritDto"),
  ActiveLinksNetworkDto = remote.require("./dto/ActiveLinksNetworkDto");

export class SpiritModel extends DataModel {
  constructor(scope) {
    super(scope);

    this.isInitialized = false;

    this.xpSummary = null;
    this.activeSpiritLinks = null;
    this.spiritId = null;
    this.level = 0;
    this.percentXP = 99;
    this.totalXP = 99999;
    this.title = "";
    this.remainingToLevel = 0;

    this.isDirty = false;
    this.dirtyFlame = 0;
    this.originalFlame = 0;
    this.activeFlameRating = 0;

    this.isAltMemberSelected = false;
    this.altMemberId = null;

    this.altModelExtension = new AltMemberSpiritExtension(this.scope);
    this.altModelDelegate = new AltModelDelegate(this, this.altModelExtension);

    this.altModelDelegate.configureDelegateCall("refreshXP");
    this.altModelDelegate.configureDelegateCall("resetFlame");

    this.altModelDelegate.configureNoOp("adjustFlame");
  }

  static get CallbackEvent() {
    return {
      XP_UPDATE: "spirit-xp-update",
      RESET_FLAME: "spirit-reset-flame",
      DIRTY_FLAME_UPDATE: "spirit-dirty-flame"
    };
  }

  isNeverLoaded = () => {
    return this.isInitialized === false;
  };

  /**
   * Show an alt member's spirit
   * @param meId
   * @param memberId
   */
  setMemberSelection = (meId, memberId) => {
    if (meId === memberId) {
      this.isAltMemberSelected = false;
      this.altMemberId = null;

      this.altModelDelegate.resetMemberSelection();
      this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
    } else {
      this.isAltMemberSelected = true;
      this.altMemberId = memberId;

      //should set the memberId on the object, then delegate the call

      this.altModelExtension.setMemberSelection(memberId);
      this.refreshXP();
    }
  };

  setDependentModel(teamModel) {
    this.altModelExtension.setDependentModel(teamModel);
  }

  getActiveScope = () => {
    if (this.isAltMemberSelected) {
      return this.altModelExtension;
    } else {
      return this;
    }
  };

  linkThisTorchie = (spiritId) => {
    console.log("SpiritModel - Request - linkThisTorchie: "+spiritId);

    let remoteUrn = "/spirit/"+spiritId+"/transition/link";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      ActiveLinksNetworkDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onLinkCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  unlink = (spiritId) => {
      console.log("SpiritModel - Request - unlink: "+spiritId);

      let remoteUrn = "/spirit/me/transition/unlink";
      let loadRequestType = DataModel.RequestTypes.POST;

      if (this.isAltMemberSelected) {
        remoteUrn = "/spirit/"+spiritId+"/transition/unlink";
      }

      this.remoteFetch(
        null,
        remoteUrn,
        loadRequestType,
        ActiveLinksNetworkDto,
        (dtoResults, err) => {
          setTimeout(() => {
            this.onUnlinkCb(dtoResults, err);
          }, DataModel.activeWaitDelay);
        }
      );
  };

  /**
   * Refreshes the current XP from the server
   */
  refreshXP = () => {

    let remoteUrn = "/spirit/me";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      SpiritDto,
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

  onLinkCb = (activeLinksNetworkDto, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      if (activeLinksNetworkDto) {
        this.activeSpiritLinks = activeLinksNetworkDto.spiritLinks;
      } else {
        this.activeSpiritLinks = [];
      }

    }

    if (this.isAltMemberSelected) {
      this.altModelExtension.refreshXP();
    } else {
      this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
    }

  };

  onUnlinkCb = (activeLinksNetworkDto, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      if (activeLinksNetworkDto) {
        this.activeSpiritLinks = activeLinksNetworkDto.spiritLinks;
      } else {
        this.activeSpiritLinks = [];
      }

    }

    if (this.isAltMemberSelected) {
      this.altModelExtension.refreshXP();
    } else {
      this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
    }
  };

  onRefreshXPCb = (spiritDto, err) => {
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
      this.remainingToLevel = this.xpSummary.xpRequiredToLevel;

    }
    this.isInitialized = true;
    this.notifyListeners(SpiritModel.CallbackEvent.XP_UPDATE);
  };
}
