import {ActiveViewController} from "./ActiveViewController";
import {DataModelFactory} from "../models/DataModelFactory";
import {ActiveCircleModel} from "../models/ActiveCircleModel";

export class TroubleshootController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    console.log("###created new controller###");
  }

  wireTogetherModels(scope) {
    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      scope
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      scope
    );
  }

  unregisterListeners() {
    this.activeCircleModel.unregisterAllListeners("troubleshootLayout");
  }

  onStartTroubleshooting = () => {
    console.log(this.name + " onStartTroubleshooting");
    this.activeCircleModel.createCircle();
  };

  onStopTroubleshooting = () => {
    console.log(this.name + " onStopTroubleshooting");
    this.activeCircleModel.closeActiveCircle();
  };
}
