import { DataModel } from "./DataModel";
import { AltModelDelegate } from "./AltModelDelegate";
import {AltMemberCircleExtension} from "./AltMemberCircleExtension";
const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto"),
  CircleKeyDto = remote.require("./dto/CircleKeyDto"),
  FeedMessageDto = remote.require("./dto/FeedMessageDto");

export class ActiveCircleModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.isInitialized = false;

    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
    this.allFeedMessages = [];
    this.problemDescription = "";
    this.circleName = "";

    this.teamModel = null;

    this.altModelExtension = new AltMemberCircleExtension(this.scope);
    this.altModelDelegate = new AltModelDelegate(this, this.altModelExtension);

    this.altModelDelegate.configureDelegateCall("loadActiveCircle");
    this.altModelDelegate.configureDelegateCall("getKey");
    this.altModelDelegate.configureDelegateCall("postChatMessageToFeed");
    this.altModelDelegate.configureDelegateCall("getAllMessagesForCircleFeed");
     this.altModelDelegate.configureDelegateCall("getCircleOwner");

    this.altModelDelegate.configureNoOp("createCircle");
    this.altModelDelegate.configureNoOp("closeActiveCircle");
    this.altModelDelegate.configureNoOp("postScreenshotReferenceToCircleFeed");
    this.altModelDelegate.configureNoOp("shelveCircleWithDoItLater");
    this.altModelDelegate.configureNoOp("resumeAnExistingCircleFromDoItLaterShelf");

  }

  static get CallbackEvent() {
    return {
      MY_CIRCLE_UPDATE: "my-circle",
      ACTIVE_CIRCLE_UPDATE: "active-circle-update",
      FEED_UPDATE: "feed-update"
    };
  }

  isNeverLoaded = () => {
    return this.isInitialized === false;
  };

  /**
   * Show an alt member's circle
   * @param meId
   * @param memberId
   */
  setMemberSelection = (meId, memberId) => {
    let oldSelectionIsAltMember = this.isAltMemberSelected;

    if (meId === memberId) {
      this.isAltMemberSelected = false;
      this.altMemberId = null;
      this.altModelDelegate.resetMemberSelection();

      //don't let this cascade updates if nothing is actually changing
      if (oldSelectionIsAltMember) {
        this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
      }

    } else {
      this.isAltMemberSelected = true;
      this.altMemberId = memberId;

      //should set the memberId on the object, then delegate the call

      this.altModelExtension.setMemberSelection(memberId);
      this.loadActiveCircle();
    }
  };

  setDependentModel(teamModel) {
    this.teamModel = teamModel;
    this.altModelExtension.setDependentModel(teamModel);
  }

  getActiveScope = () => {
    if (this.isAltMemberSelected) {
      return this.altModelExtension;
    } else {
      return this;
    }
  };

  getCircleOwner = () => {

    console.log("CIRCLE OWNER ME : "+this.teamModel.me['shortName']);

    return this.teamModel.me['shortName'];
  };

  /**
   * Loads the active circle into context
   */
  loadActiveCircle = () => {
    console.log("ActiveCircleModel - Request - loadActiveCircle");

    let remoteUrn = "/circle/active";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onActiveCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Creates a new troubleshooting circle on the server
   */
  createCircle = problemDescription => {
    let args = { problemDescription: problemDescription };
    console.log("ActiveCircleModel - Request - createCircle, args: " + args);
    let remoteUrn = "/circle";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onCreateCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Closes the active circle on the server
   */
  closeActiveCircle = () => {
    console.log(
      "ActiveCircleModel - Request - closeActiveCircle, Context: activeCircleId " +
        this.activeCircleId
    );
    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/" + this.activeCircleId + "/transition/close";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onCloseCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Retrieves the private key for the circle
   */

  getKey = callback => {
    console.log(
      "ActiveCircleModel - Request - getKey, Context: activeCircleId " +
        this.activeCircleId
    );
    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/" + this.activeCircleId + "/key";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      CircleKeyDto,
      (keyResultsDto, err) => {
        setTimeout(() => {
          callback.call(this.scope, keyResultsDto.privateKey);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Posts a chat message to the circle feed (by the current user)
   * @param chatMessage
   */
  postChatMessageToFeed = chatMessage => {
    let args = { chatMessage: chatMessage };
    console.log(
      "ActiveCircleModel - Request - postChatMessageToFeed, args: " + args
    );

    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/" + this.activeCircleId + "/feed/chat";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      FeedMessageDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onPostChatMessageToFeedCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Post a screenshot reference to the circle feed (by the current user)
   * @param fileName
   * @param filePath
   */
  postScreenshotReferenceToCircleFeed = (fileName, filePath) => {
    let args = { fileName: fileName, filePath: filePath };
    console.log(
      "ActiveCircleModel - Request - postScreenshotReferenceToCircleFeed, args: " +
        args
    );

    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/" + this.activeCircleId + "/feed/screenshot";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      FeedMessageDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onPostScreenshotReferenceToFeedCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Retrieve all messages for the feed
   */
  getAllMessagesForCircleFeed = () => {
    console.log("ActiveCircleModel - Request - getAllMessagesForCircleFeed");
    let remoteUrn = "/circle/" + this.activeCircleId + "/feed";
    let loadRequestType = DataModel.RequestTypes.GET;

    if (this.activeCircleId == null) {
      return;
    }

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      FeedMessageDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onGetAllMessagesForCircleFeedCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Shelves the active circle with "Do It Later"
   */
  shelveCircleWithDoItLater = () => {
    console.log(
      "ActiveCircleModel - Request - shelveCircleWithDoItLater, Context: activeCircleId " +
        this.activeCircleId
    );
    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/" + this.activeCircleId + "/transition/doitlater";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onShelveCircleWithDoItLaterCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Resume an existing circle from the Do It Later shelf
   */
  resumeAnExistingCircleFromDoItLaterShelf = () => {
    console.log(
      "ActiveCircleModel - Request - resumeAnExistingCircleFromDoItLaterShelf"
    );

    let remoteUrn = "/circle/" + this.activeCircleId + "/transition/resume";
    let loadRequestType = DataModel.RequestTypes.POST;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      CircleDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onResumeCircleCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  //////////// REMOTE CALLBACK HANDLERS  ////////////

  onActiveCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onActiveCircleCb");
    let oldCircle = this.activeCircleId;

    if (err) {
      console.log("error:" + err);
    } else {
      if (circleDto) {
        console.log(
          "ActiveCircleModel : onActiveCircleCb - configuring Circle: " +
            circleDto
        );
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
        this.problemDescription = circleDto.problemDescription;
        this.circleName = circleDto.circleName;


      } else {
        console.log("ActiveCircleModel : onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
        this.problemDescription = "";
        this.circleName = "";

      }
    }
    this.isInitialized = true;

    if (oldCircle !== this.activeCircleId) {
      this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
    }
  };


  onCreateCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onCreateCircleCb");

    if (err) {
      console.log("error:" + err);
    } else {
      if (circleDto) {
        console.log(
          "ActiveCircleModel : onActiveCircleCb - configuring Circle: " +
          circleDto
        );
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
        this.problemDescription = circleDto.problemDescription;
        this.circleName = circleDto.circleName;


      } else {
        console.log("ActiveCircleModel : onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
        this.problemDescription = "";
        this.circleName = "";

      }
    }

    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);

  };

  onCloseCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onCloseCircleCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.isAlarmTriggered = false;
      this.activeCircleId = null;
      this.activeCircle = null;
      this.allFeedMessages = [];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onShelveCircleWithDoItLaterCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onShelveCircleWithDoItLaterCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.isAlarmTriggered = false;
      this.activeCircleId = null;
      this.activeCircle = null;
      this.allFeedMessages = [];
    }

    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onResumeCircleCb = (circleDto, err) => {
    console.log("ActiveCircleModel : onResumeCircleCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.activeCircleId = circleDto.id;
      this.activeCircle = circleDto;
      this.isAlarmTriggered = true;
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onGetAllMessagesForCircleFeedCb = (feedMessageDtos, err) => {
    console.log("ActiveCircleModel : onGetAllMessagesForCircleFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = feedMessageDtos;
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

  onPostChatMessageToFeedCb = (feedMessageDto, err) => {
    console.log("ActiveCircleModel : onPostChatMessageToFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

  onPostScreenshotReferenceToFeedCb = (feedMessageDto, err) => {
    console.log("ActiveCircleModel : onPostScreenshotReferenceToFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

}
