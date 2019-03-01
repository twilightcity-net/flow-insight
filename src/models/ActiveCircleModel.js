import { DataModel } from "./DataModel";

const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto"),
  CircleKeyDto = remote.require("./dto/CircleKeyDto"),
  FeedMessageDto = remote.require("./dto/FeedMessageDto");

export class ActiveCircleModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
  }

  static get CallbackEvent() {
    return {
      CIRCLE_UPDATE: "circle-update",
      FEED_UPDATE: "feed-update",
    };
  }

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
  createCircle = (problemDescription) => {
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
          this.onActiveCircleCb(dtoResults, err);
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

  getKey = (callback) => {
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
  postChatMessageToFeed = (chatMessage) => {
    let args = { chatMessage: chatMessage };
    console.log("ActiveCircleModel - Request - postChatMessageToFeed, args: " + args);

    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/"+this.activeCircleId+"/feed/chat";
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
    console.log("ActiveCircleModel - Request - postScreenshotReferenceToCircleFeed, args: " + args);

    if (this.activeCircleId == null) {
      return;
    }

    let remoteUrn = "/circle/"+this.activeCircleId+"/feed/screenshot";
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
    let remoteUrn = "/circle/"+this.activeCircleId+"/feed";
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
      "ActiveCircleModel - Request - resumeAnExistingCircleFromDoItLaterShelf");

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
      } else {
        console.log("ActiveCircleModel : onActiveCircleCb - no circle found");
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
      }
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE);
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
    this.notifyListeners(ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE);
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
    this.notifyListeners(ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE);
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
    this.notifyListeners(ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE);
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

  onPostScreenshotReferenceToFeedCb = (feedMessageDto, err) => {
    console.log("ActiveCircleModel : onPostScreenshotReferenceToFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
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

}
