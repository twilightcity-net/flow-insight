import { TeamModel } from "../models/TeamModel";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { JournalModel } from "../models/JournalModel";
import { DataModelFactory } from "../models/DataModelFactory";
import { WTFTimer } from "../models/WTFTimer";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";

/**
 * This class is used to coordinate models across all the events
 */
export class ModelCoordinator {
  constructor(scope) {
    this.name = "[ModelCoordinator]";
    this.scope = scope;
  }

  static instance;

  static init(scope) {
    if (!ModelCoordinator.instance) {
      ModelCoordinator.instance = new ModelCoordinator(scope);
      ModelCoordinator.instance.wireModelsTogether();
    }
  }

  wireModelsTogether = () => {
    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );
    this.activeCircle = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
    this.wtfTimer = DataModelFactory.createModel(
      DataModelFactory.Models.WTF_TIMER,
      this
    );

    this.activeCircle.setDependentModel(this.teamModel);
    this.wtfTimer.setDependentModel(this.activeCircle);

    this.loadDefaultModels();
    this.wireTogetherModelsAfterInitialLoad();

    //TODO refactor this one out
    //    this.onDirtySpiritFlameUpdateActiveRow();
  };

  loadDefaultModels() {
    this.journalModel.loadDefaultJournal();
    this.activeCircle.loadActiveCircle();
    this.spiritModel.refreshXP();
    this.teamModel.refreshAll();
  }

  wireTogetherModelsAfterInitialLoad() {
    setTimeout(() => {
      this.onMyCircleUpdateMe();
      this.onActiveCircleUpdateTimer();

      this.onJournalEntryUpdateMeAndXP();
      this.onJournalUpdateResetSpiritFlame();

      this.onChangeActiveRowResetSpiritFlame();
      this.onTeamMemberChangeActiveScopeForAllModels();

      this.onWTFTimerUpdateRefreshTeamMemberTimers();
    }, 1000);
  }

  unregisterModelWirings = () => {
    this.journalModel.unregisterAllListeners(this.name);
    this.teamModel.unregisterAllListeners(this.name);
    this.spiritModel.unregisterAllListeners(this.name);
    this.activeCircle.unregisterAllListeners(this.name);
  };

  onActiveCircleUpdateTimer() {
    this.activeCircle.registerListener(
      this.name,
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      () => {
        console.log("ModelCoordinator Event Fired: onActiveCircleUpdateTimer");
        this.wtfTimer.resetTimer();
      }
    );
  }

  onMyCircleUpdateMe() {
    this.activeCircle.registerListener(
      this.name,
      ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE,
      () => {
        console.log("ModelCoordinator Event Fired: onActiveCircleUpdateMe");
        this.teamModel.refreshMe();
      }
    );
  }

  onJournalEntryUpdateMeAndXP() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.NEW_JOURNAL_ITEM_ADDED,
      () => {
        console.log(
          "ModelCoordinator Event Fired: onJournalEntryUpdateMeAndXP"
        );

        this.teamModel.refreshMe();
        this.spiritModel.refreshXP();
      }
    );
  }

  onJournalUpdateResetSpiritFlame() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE,
      () => {
        console.log(
          "ModelCoordinator Event Fired: onJournalUpdateResetSpiritFlame"
        );

        if (this.journalModel.getActiveScope().activeJournalItem != null) {
          let activeFlame = this.journalModel.getActiveScope().activeJournalItem
            .flameRating;
          this.spiritModel.resetFlame(activeFlame);
        }
      }
    );
  }

  onChangeActiveRowResetSpiritFlame() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE,
      () => {
        console.log(
          "ModelCoordinator Event Fired: onChangeActiveRowResetSpiritFlame"
        );

        if (this.journalModel.getActiveScope().activeJournalItem != null) {
          let activeFlame = this.journalModel.getActiveScope().activeJournalItem
            .flameRating;
          this.spiritModel.resetFlame(activeFlame);
        }
      }
    );
  }

  onTeamMemberChangeActiveScopeForAllModels() {
    this.teamModel.registerListener(
      this.name,
      TeamModel.CallbackEvent.ACTIVE_MEMBER_UPDATE,
      () => {
        console.log(
          "ModelCoordinator Event Fired: onTeamMemberChangeActiveScopeForAllModels"
        );
        this.journalModel.setMemberSelection(
          this.teamModel.me.id,
          this.teamModel.activeTeamMember.id
        );

        this.spiritModel.setMemberSelection(
          this.teamModel.me.id,
          this.teamModel.activeTeamMember.id
        );

        this.activeCircle.setMemberSelection(
          this.teamModel.me.id,
          this.teamModel.activeTeamMember.id
        );
      }
    );
  }

  onWTFTimerUpdateRefreshTeamMemberTimers() {
    this.wtfTimer.registerListener(
      this.name,
      WTFTimer.CallbackEvent.WTF_TIMER_MINUTES_UPDATE,
      () => {
        console.log(
          "ModelCoordinator Event Fired: onWTFTimerUpdateRefreshTeamMemberTimers"
        );
        this.teamModel.refreshMe();
      }
    );
  }
}
