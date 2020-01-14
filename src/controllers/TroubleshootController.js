import { ActiveViewController } from "./ActiveViewController";
import { DataModelFactory } from "../models/DataModelFactory";
import { CircuitClient } from "../clients/CircuitClient";

export class TroubleshootController extends ActiveViewController {
  wireTogetherModels(scope) {
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      scope
    );
  }

  startTroubleshooting = () => {
    console.log(this.name + " start troubleshooting");
    CircuitClient.createLearningCircuitModel("angry_teachers", this, model => {
      console.log(model);
    });
  };

  stopTroubleshooting = () => {
    console.log(this.name + " stop troubleshooting");
  };
}
