import { ActiveViewController } from "./ActiveViewController";
import { DataModelFactory } from "../models/DataModelFactory";

export class TroubleshootController extends ActiveViewController {
  wireTogetherModels(scope) {
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      scope
    );
  }

  startTroubshooting = () => {
    console.log(this.name + " start troubleshooting");
  };

  stopTroubleshooting = () => {
    console.log(this.name + " stop troubleshooting");
  };
}
