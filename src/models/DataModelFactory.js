import { TeamModel } from "./TeamModel";
import { ActiveCircleModel } from "./ActiveCircleModel";
import { JournalModel } from "./JournalModel";
import { SpiritModel } from "./SpiritModel";
import { WTFTimer } from "./WTFTimer";

/**
 * this class is used to manage DtoClient requests for Stores
 */
export class DataModelFactory {
  /**
   * an object that stores a list of models by keys
   * @type {{}}
   */
  static modelsByName = {};

  /**
   * the possible DataModels to lookup
   * @returns {{MEMBER_STATUS: string, ACTIVE_CIRCLE: string, JOURNAL: string, WTF_TIMER: string, SPIRIT: string}}
   * @constructor
   */
  static get Models() {
    return {
      MEMBER_STATUS: "member-status",
      ACTIVE_CIRCLE: "active-circle",
      JOURNAL: "active-journal",
      SPIRIT: "spirit",
      WTF_TIMER: "wtf-intervalTicker"
    };
  }

  /**
   * creates a new model
   * @param name - the name of the model to create
   * @param scope - the scope of the model to create in
   * @returns {null} - returns the DataModel class of object
   */
  static createModel(name, scope) {
    return DataModelFactory.findOrCreateModel(name, scope);
  }

  /**
   * looks for an instance of the DataModel in the local memory, or creates a new instance
   * @param name - the name of the model to look up
   * @param scope - the scope of the model to look up in
   * @returns {*} - returns existing instance of the model or a new instance
   */
  static findOrCreateModel(name, scope) {
    let storeFound = null;

    if (DataModelFactory.modelsByName[name] != null) {
      storeFound = DataModelFactory.modelsByName[name];
    } else {
      storeFound = DataModelFactory.initializeNewModel(name, scope);
      DataModelFactory.modelsByName[name] = storeFound;
    }

    return storeFound;
  }

  /**
   * initializes the new model based on the name and the scope
   * @param name - the name of the model to reference
   * @param scope - the scope of the execution
   * @returns {TeamModel|SpiritModel|JournalModel|null|WTFTimer|ActiveCircleModel}
   */
  static initializeNewModel(name, scope) {
    switch (name) {
      case DataModelFactory.Models.MEMBER_STATUS:
        return new TeamModel(scope);
      case DataModelFactory.Models.ACTIVE_CIRCLE:
        return new ActiveCircleModel(scope);
      case DataModelFactory.Models.WTF_TIMER:
        return new WTFTimer(scope);
      case DataModelFactory.Models.JOURNAL:
        return new JournalModel(scope);
      case DataModelFactory.Models.SPIRIT:
        return new SpiritModel(scope);
      default:
        return null;
    }
  }
}
