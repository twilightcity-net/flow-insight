import { TeamModel } from "./TeamModel";
import { ActiveCircleModel } from "./ActiveCircleModel";
import { JournalModel } from "./JournalModel";
import { SpiritModel } from "./SpiritModel";
import { WTFTimer } from "./WTFTimer";

//
// this class is used to manage DataClient requests for Stores
//
export class DataModelFactory {
  static modelsByName = {};

  static createModel(name, scope) {
    return DataModelFactory.findOrCreateModel(name, scope);
  }

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

  static get Models() {
    return {
      MEMBER_STATUS: "member-status",
      ACTIVE_CIRCLE: "active-circle",
      JOURNAL: "active-journal",
      SPIRIT: "spirit",
      WTF_TIMER: "wtf-intervalTicker"
    };
  }
}
