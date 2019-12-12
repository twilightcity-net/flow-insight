import { DataModel } from "./DataModel";
import { AltModelDelegate } from "./AltModelDelegate";
import { AltMemberCircleExtension } from "./AltMemberCircleExtension";
const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto"),
  // CircleKeysDto = remote.require("./dto/CircleKeysDto"),
  FeedMessageDto = remote.require("./dto/FeedMessageDto");

export class ActiveCircleModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.name = "[ActiveCircleModel]";

    this.isInitialized = false;

    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
    this.allFeedMessages = [];
    this.problemDescription = "";
    this.circleName = "";

    this.hypercoreFeedId = null;
    this.hypercorePublicKey = null;
    this.hypercoreSecretKey = null;

    this.teamModel = null;

    this.altModelExtension = new AltMemberCircleExtension(this.scope);
    this.altModelDelegate = new AltModelDelegate(this, this.altModelExtension);

    this.altModelDelegate.configureDelegateCall("loadActiveCircle");
    this.altModelDelegate.configureDelegateCall("refreshKeys");
    this.altModelDelegate.configureDelegateCall("postChatMessageToFeed");
    this.altModelDelegate.configureDelegateCall("getAllMessagesForCircleFeed");
    this.altModelDelegate.configureDelegateCall("getCircleOwner");

    this.altModelDelegate.configureNoOp("createCircle");
    this.altModelDelegate.configureNoOp("closeActiveCircle");
    this.altModelDelegate.configureNoOp("postScreenshotReferenceToCircleFeed");
    this.altModelDelegate.configureNoOp("shelveCircleWithDoItLater");
    this.altModelDelegate.configureNoOp(
      "resumeAnExistingCircleFromDoItLaterShelf"
    );
  }

  static get CallbackEvent() {
    return {
      MY_CIRCLE_UPDATE: "my-circle",
      ACTIVE_CIRCLE_UPDATE: "active-circle-update",
      FEED_UPDATE: "feed-update",
      REFRESH_KEYS_UPDATE: "refresh-keys-update"
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
        this.notifyListeners(
          ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE
        );
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
    let member = "Member";

    if (this.teamModel) {
      member = this.teamModel.me["shortName"];
    }

    return member;
  };

  /**
   * Loads the active circle into context
   */
  loadActiveCircle = () => {
    console.log(this.name + " - Request - loadActiveCircle");

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
  createCircle = () => {
    if (!this.isInitialized) return;

    let args = { problemDescription: "[Start WTF]" };
    console.log(this.name + " - Request - createCircle, args: " + args);
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
    if (!this.isInitialized) return;

    console.log(
      this.name +
        " - Request - closeActiveCircle, Context: activeCircleId " +
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
   * Posts a chat message to the circle feed (by the current user)
   * @param chatMessage
   */
  postChatMessageToFeed = chatMessage => {
    if (!this.isInitialized) return;

    let args = { chatMessage: chatMessage };
    console.log(
      this.name + " - Request - postChatMessageToFeed, args: " + args
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
    if (!this.isInitialized) return;

    let args = { fileName: fileName, filePath: filePath };
    console.log(
      this.name +
        " - Request - postScreenshotReferenceToCircleFeed, args: " +
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
    if (!this.isInitialized) return;

    console.log(this.name + " - Request - getAllMessagesForCircleFeed");
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
    if (!this.isInitialized) return;

    console.log(
      this.name +
        " - Request - shelveCircleWithDoItLater, Context: activeCircleId " +
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
    if (!this.isInitialized) return;

    console.log(
      this.name + " - Request - resumeAnExistingCircleFromDoItLaterShelf"
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
    console.log(this.name + " - onActiveCircleCb");
    let oldCircle = this.activeCircleId;

    if (err) {
      console.log("error:" + err);
    } else {
      if (circleDto) {
        console.log(
          this.name +
            " - onActiveCircleCb - configuring Circle: " +
            circleDto.circleName
        );
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
        this.problemDescription = circleDto.problemDescription;
        this.circleName = circleDto.circleName;
        this.hypercoreFeedId = circleDto.hypercoreFeedId;
        this.hypercorePublicKey = circleDto.hypercorePublicKey;
        this.hypercoreSecretKey = circleDto.hypercoreSecretKey;
      } else {
        console.log(this.name + " - onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
        this.problemDescription = "";
        this.circleName = "";
        this.hypercoreFeedId = null;
        this.hypercorePublicKey = null;
        this.hypercoreSecretKey = null;
      }
    }
    this.isInitialized = true;

    if (oldCircle !== this.activeCircleId) {
      this.notifyListeners(
        ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE
      );
    }
  };

  onCreateCircleCb = (circleDto, err) => {
    console.log(this.name + " - onCreateCircleCb");

    if (err) {
      console.log("error:" + err);
    } else {
      if (circleDto) {
        console.log(
          this.name + " - onActiveCircleCb - configuring Circle: " + circleDto
        );
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
        this.problemDescription = circleDto.problemDescription;
        this.circleName = circleDto.circleName;
        this.hypercoreFeedId = circleDto.hypercoreFeedId;
        this.hypercorePublicKey = circleDto.hypercorePublicKey;
        this.hypercoreSecretKey = circleDto.hypercoreSecretKey;
      } else {
        console.log(this.name + " - onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
        this.problemDescription = "";
        this.circleName = "";
        this.hypercoreFeedId = null;
        this.hypercorePublicKey = null;
        this.hypercoreSecretKey = null;
      }
    }

    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onCloseCircleCb = (circleDto, err) => {
    console.log(this.name + " - onCloseCircleCb");
    if (err) {
      console.log(this.name + " - error:" + err);
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
    console.log(this.name + " - onShelveCircleWithDoItLaterCb");
    if (err) {
      console.log(this.name + " - error:" + err);
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
    console.log(this.name + " - onResumeCircleCb");
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.activeCircleId = circleDto.id;
      this.activeCircle = circleDto;
      this.isAlarmTriggered = true;
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.MY_CIRCLE_UPDATE);
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onGetAllMessagesForCircleFeedCb = (feedMessageDtos, err) => {
    console.log(this.name + " - onGetAllMessagesForCircleFeedCb");
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.allFeedMessages = feedMessageDtos;
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

  onPostChatMessageToFeedCb = (feedMessageDto, err) => {
    console.log(this.name + " - onPostChatMessageToFeedCb");
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

  onPostScreenshotReferenceToFeedCb = (feedMessageDto, err) => {
    console.log(this.name + " - onPostScreenshotReferenceToFeedCb");
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };
}
