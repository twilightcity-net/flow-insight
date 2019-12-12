import { TeamModel } from "../models/TeamModel";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { JournalModel } from "../models/JournalModel";
import { DataModelFactory } from "../models/DataModelFactory";
import { WTFTimer } from "../models/WTFTimer";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";
import { RendererEventFactory } from "../RendererEventFactory";

/**
 * This class is used to coordinate models across all the events
 */
export class ModelCoordinator {
  constructor(scope) {
    this.name = "[ModelCoordinator]";
    this.scope = scope;
  }

  static instance;

  /**
   * does the initial setup and wires the model controllers together
   * @param scope - this is the scope to call functions within
   */
  static init(scope) {
    if (!ModelCoordinator.instance) {
      ModelCoordinator.instance = new ModelCoordinator(scope);
      ModelCoordinator.instance.wireModelsTogether();
    }
  }

  /**
   * wires the models together in the local static scope
   */
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
    this.updateModels();

    //TODO refactor this one out
    //    this.onDirtySpiritFlameUpdateActiveRow();
  };

  /**
   * loads the default models for the stores
   */
  loadDefaultModels() {
    this.journalModel.loadDefaultJournal();
    this.activeCircle.loadActiveCircle();
    this.spiritModel.refreshXP();
    this.teamModel.refreshAll();
  }

  /**
   * updates necessary models
   */
  updateModels() {
    console.log("[ModelCoordinator] update all models");
    this.onMyCircleUpdateMe();
    this.onActiveCircleUpdateTimer();

    this.onJournalEntryUpdateMeAndXP();
    this.onJournalUpdateResetSpiritFlame();

    this.onChangeActiveRowResetSpiritFlame();
    this.onTeamMemberChangeActiveScopeForAllModels();

    this.onWTFTimerUpdateRefreshTeamMemberTimers();
  }

  /**
   * removed references to the models and call backs for memory leaking
   */
  unregisterModelWirings = () => {
    this.journalModel.unregisterAllListeners(this.name);
    this.teamModel.unregisterAllListeners(this.name);
    this.spiritModel.unregisterAllListeners(this.name);
    this.activeCircle.unregisterAllListeners(this.name);
  };

  /**
   * updates the timer for the active circles for wtf sessions
   */
  onActiveCircleUpdateTimer() {
    this.activeCircle.registerListener(
      this.name,
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onActiveCircleUpdateTimer"
        );
        this.wtfTimer.resetTimer();
      }
    );
  }

  /**
   * updates the users information when they are selected as the active user
   */
  onMyCircleUpdateMe() {
    this.activeCircle.registerListener(
      this.name,
      ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE,
      () => {
        console.log("[ModelCoordinator] Event Fired: onActiveCircleUpdateMe");
        this.teamModel.refreshMe();
      }
    );
  }

  /**
   * updates the users xp and journal entry models when creating a new model
   */
  onJournalEntryUpdateMeAndXP() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.NEW_JOURNAL_ITEM_ADDED,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onJournalEntryUpdateMeAndXP"
        );

        this.teamModel.refreshMe();
        this.spiritModel.refreshXP();
      }
    );
  }

  /**
   * sets the spirit flame intensity
   */
  onJournalUpdateResetSpiritFlame() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onJournalUpdateResetSpiritFlame"
        );

        if (this.journalModel.getActiveScope().activeJournalItem != null) {
          let activeFlame = this.journalModel.getActiveScope().activeJournalItem
            .flameRating;
          this.spiritModel.resetFlame(activeFlame);
        }
      }
    );
  }

  /**
   * changes the spirit flame intensity on the individual journal items
   */
  onChangeActiveRowResetSpiritFlame() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onChangeActiveRowResetSpiritFlame"
        );

        if (this.journalModel.getActiveScope().activeJournalItem != null) {
          let activeFlame = this.journalModel.getActiveScope().activeJournalItem
            .flameRating;
          this.spiritModel.resetFlame(activeFlame);
        }
      }
    );
  }

  /**
   * changes the models with the selected users information stored in dreamtalk
   */
  onTeamMemberChangeActiveScopeForAllModels() {
    this.teamModel.registerListener(
      this.name,
      TeamModel.CallbackEvent.ACTIVE_MEMBER_UPDATE,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onTeamMemberChangeActiveScopeForAllModels"
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

  /**
   * update wtf timers
   */
  onWTFTimerUpdateRefreshTeamMemberTimers() {
    this.wtfTimer.registerListener(
      this.name,
      WTFTimer.CallbackEvent.WTF_TIMER_MINUTES_UPDATE,
      () => {
        console.log(
          "[ModelCoordinator] Event Fired: onWTFTimerUpdateRefreshTeamMemberTimers"
        );
        this.teamModel.refreshMe();
      }
    );
  }
}
