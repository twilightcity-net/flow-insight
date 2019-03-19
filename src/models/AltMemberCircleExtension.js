import { DataModel } from "./DataModel";
import { ActiveCircleModel } from "./ActiveCircleModel";
const { remote } = window.require("electron"),
  CircleKeyDto = remote.require("./dto/CircleKeyDto"),
  FeedMessageDto = remote.require("./dto/FeedMessageDto");

export class AltMemberCircleExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
    this.allFeedMessages = [];
    this.problemDescription = "";
    this.circleName = "";

    this.altMemberId = null;
  }

  setMemberSelection(memberId) {
    this.altMemberId = memberId;
    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
  }

  setDependentModel(teamModel) {
    this.teamModel = teamModel;
  }

  getCircleOwner = () => {
    return this.teamModel.getMemberStatus(this.altMemberId).shortName;
  };

  /**
   * Retrieves true if this member is already loaded
   */
  isMemberLoaded(memberId) {
    return this.altMemberId != null && this.altMemberId === memberId;
  }

  /**
   * Loads the active circle into context
   */
  loadActiveCircle = () => {
    console.log("AltModelCircleExtension - Request - loadActiveCircle");

    let memberStatus = this.teamModel.getMemberStatus(this.altMemberId);
    let activeCircle = memberStatus.activeCircle;

    this.allFeedMessages = [];

    if (activeCircle != null) {
      this.activeCircleId = activeCircle.id;
      this.activeCircle = activeCircle;
      this.isAlarmTriggered = true;
      this.problemDescription = activeCircle.problemDescription;
      this.circleName = activeCircle.circleName;
    } else {
      this.activeCircleId = null;
      this.activeCircle = null;
      this.isAlarmTriggered = false;
      this.problemDescription = "";
      this.circleName = "";
    }

    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  /**
   * Retrieves the private key for the circle
   */

  getKey = callback => {
    console.log(
      "AltModelCircleExtension - Request - getKey, Context: activeCircleId " +
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
      "AltModelCircleExtension - Request - postChatMessageToFeed, args: " + args
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
   * Retrieve all messages for the feed
   */
  getAllMessagesForCircleFeed = () => {
    console.log(
      "AltModelCircleExtension - Request - getAllMessagesForCircleFeed"
    );
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

  //////////// REMOTE CALLBACK HANDLERS  ////////////

  onActiveCircleCb = (circleDto, err) => {
    console.log("AltModelCircleExtension : onActiveCircleCb");
    if (err) {
      console.log("error:" + err);
    } else {
      if (circleDto) {
        console.log(
          "AltModelCircleExtension : onActiveCircleCb - configuring Circle: " +
            circleDto
        );
        this.activeCircleId = circleDto.id;
        this.activeCircle = circleDto;
        this.isAlarmTriggered = true;
      } else {
        console.log(
          "AltModelCircleExtension : onActiveCircleCb - no circle found"
        );
        this.isAlarmTriggered = false;
        this.activeCircleId = null;
        this.activeCircle = null;
        this.allFeedMessages = [];
      }
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  onGetAllMessagesForCircleFeedCb = (feedMessageDtos, err) => {
    console.log("AltModelCircleExtension : onGetAllMessagesForCircleFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = feedMessageDtos;
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };

  onPostChatMessageToFeedCb = (feedMessageDto, err) => {
    console.log("AltModelCircleExtension : onPostChatMessageToFeedCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.allFeedMessages = [...this.allFeedMessages, feedMessageDto];
    }
    this.notifyListeners(ActiveCircleModel.CallbackEvent.FEED_UPDATE);
  };
}
