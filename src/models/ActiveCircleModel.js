import {DataModel} from "./DataModel";

const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto");


export class ActiveCircleModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;

    this.callbackOnUpdate = () => {}
  }

  registerCallbackOnUpdate = (callback) => {
     this.callbackOnUpdate = callback;
  };

  /**
   * Loads the active circle into context
   */
  loadActiveCircle = () => {
    console.log("ActiveCircleModel - Request - loadActiveCircle");
    let remoteUrn = "/circle/active";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(null, remoteUrn, loadRequestType, CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onActiveCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });
  };

  /** Creates a new troubleshooting circle on the server
   *
   * @param problemStatement
   */
  createCircle = (problemDescription) => {
    let args = {problemDescription: problemDescription};
     console.log("ActiveCircleModel - Request - createCircle, args: " +args);
     let remoteUrn = "/circle";
     let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(args, remoteUrn, loadRequestType, CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onActiveCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
    });
  };

  /**
   * Closes the active circle on the server
   */
  closeActiveCircle = () => {
    console.log("ActiveCircleModel - Request - closeActiveCircle, Context: activeCircleId " +this.activeCircleId);
    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/"+this.activeCircleId + "/transition/close";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(null, remoteUrn, loadRequestType, CircleDto, (dtoResults, err) => {
      setTimeout(() => {
        this.onCloseCircleCb(dtoResults, err);
      }, DataModel.activeWaitDelay);
    });
  };

  onActiveCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onActiveCircleCb");
    if (err) {
      console.log("error:" + err);
    } else {

      if (circleDto) {
        console.log("ActiveCircleModel : onActiveCircleCb - configuring Circle: "+circleDto);
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
      } else {
        console.log("ActiveCircleModel : onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
      }
    }
    this.callbackOnUpdate.call(this.scope);
  };

  onCloseCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onCloseCircleCb");
    if (err) {
      console.log("error:" + err);
    } else {

      this.isAlarmTriggered = false;
      this.activeCircleId = null;
      this.activeCircle = null;

    }
    this.callbackOnUpdate.call(this.scope);
  };

}
