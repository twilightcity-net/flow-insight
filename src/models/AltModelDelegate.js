import UtilRenderer from "../UtilRenderer";
import { RendererEventFactory } from "../RendererEventFactory";

//
// this base class is used for Stores
//
export class AltModelDelegate {

  constructor(primaryModel, altModel) {
    this.primaryModel = primaryModel;
    this.altModel = altModel;

    this.isAltMemberSelected = false;
    this.altMemberId = null;

    this.cascadeNotificationChains(this.primaryModel, 'notifyListeners', this.altModel)
  }

  /**
   * Delegates calls for the
   * @param memberId
   */
  setMemberSelection(memberId) {
     this.isAltMemberSelected = true;
     this.altMemberId = memberId;

     this.altModel.setMemberSelection(memberId);
  }

  /**
   * Resets the delegate to revert to the original method
   */
  resetMemberSelection() {
    this.isAltMemberSelected = false;
    this.altMemberId = null;
  }

  /**
   * Configures a function for delegation from primaryModel, to the altModel
   * @param functionName
   */
  configureDelegateCall(functionName) {
    console.log("delegate function: " +functionName);
    this.delegateIfAltMemberConfigured(this.primaryModel, functionName, this.altModel);

  }

  delegateIfAltMemberConfigured = (primaryModel, method, altModel) => {

    var primaryMethod = primaryModel[method];
    var altMethod = altModel[method];

    primaryModel[method] = function () {
      if (this.altMemberId) {
        altMethod.apply(altModel, arguments);
      } else {
        primaryMethod.apply(primaryModel, arguments);
      }
    };
  };

  cascadeNotificationChains = (primaryModel, notifyMethod, altModel) => {

    var primaryMethod = primaryModel[notifyMethod];
    var altMethod = altModel[notifyMethod];

    altModel[notifyMethod] = function () {
      altMethod.apply(altModel, arguments);
      primaryMethod.apply(primaryModel, arguments);
    };
  };


}
