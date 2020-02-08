import { TeamModel } from "../models/TeamModel";
import { JournalModel } from "../models/JournalModel";
import { DataModelFactory } from "../models/DataModelFactory";

/**
 * This class is used to coordinate models across all the events
 */
export class ModelCoordinator {
  /**
   * the static refrence to the global instance
   */
  static instance;

  /**
   * builds the coordinator class with a given context scope
   * @param scope - the scope to build the coordinator in
   */
  constructor(scope) {
    this.name = "[ModelCoordinator]";
    this.scope = scope;
  }

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
    this.loadDefaultModels();
    this.updateModels();
  };

  /**
   * loads the default models for the stores
   */
  loadDefaultModels() {
    console.log(this.name + " load default models");
    this.journalModel.loadDefaultJournal();
    this.spiritModel.refreshXP();
  }

  /**
   * updates necessary models
   */
  updateModels() {
    console.log(this.name + " update models");
    this.onJournalEntryUpdateMeAndXP();
    this.onJournalUpdateResetSpiritFlame();
    this.onChangeActiveRowResetSpiritFlame();
    this.onTeamMemberChangeActiveScopeForAllModels();
  }

  /**
   * removed references to the models and call backs for memory leaking
   */
  unregisterModelWirings = () => {
    console.log(this.name + " unregister models");
    this.journalModel.unregisterAllListeners(this.name);
    this.teamModel.unregisterAllListeners(this.name);
    this.spiritModel.unregisterAllListeners(this.name);
  };

  /**
   * updates the users xp and journal entry models when creating a new model
   */
  onJournalEntryUpdateMeAndXP() {
    this.journalModel.registerListener(
      this.name,
      JournalModel.CallbackEvent.NEW_JOURNAL_ITEM_ADDED,
      () => {
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
        this.journalModel.setMemberSelection(
          this.teamModel.me.id,
          this.teamModel.activeTeamMember.id
        );
        this.spiritModel.setMemberSelection(
          this.teamModel.me.id,
          this.teamModel.activeTeamMember.id
        );
      }
    );
  }
}
