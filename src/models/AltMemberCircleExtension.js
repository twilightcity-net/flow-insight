import { DataModel } from "./DataModel";
import { ActiveCircleModel } from "./ActiveCircleModel";
const { remote } = window.require("electron"),
  CircleKeysDto = remote.require("./dto/CircleKeysDto"),
  FeedMessageDto = remote.require("./dto/FeedMessageDto");

export class AltMemberCircleExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.name = "[AltMemberCircleExtension]";

    this.activeCircleId = null;
    this.activeCircle = null;
    this.isAlarmTriggered = false;
    this.allFeedMessages = [];
    this.problemDescription = "";
    this.circleName = "";
    this.hypercoreFeedId = null;
    this.hypercorePublicKey = null;
    this.hypercoreSecretKey = null;

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
    console.log(this.name + " - Request - loadActiveCircle");

    let memberStatus = this.teamModel.getMemberStatus(this.altMemberId);
    let activeCircle = memberStatus.activeCircle;

    this.allFeedMessages = [];

    if (activeCircle != null) {
      this.activeCircleId = activeCircle.id;
      this.activeCircle = activeCircle;
      this.isAlarmTriggered = true;
      this.problemDescription = activeCircle.problemDescription;
      this.circleName = activeCircle.circleName;
      this.hypercoreFeedId = activeCircle.hypercoreFeedId;
      this.hypercorePublicKey = activeCircle.hypercorePublicKey;
      this.hypercoreSecretKey = activeCircle.hypercoreSecretKey;
    } else {
      this.activeCircleId = null;
      this.activeCircle = null;
      this.isAlarmTriggered = false;
      this.problemDescription = "";
      this.circleName = "";
      this.hypercoreFeedId = null;
      this.hypercorePublicKey = null;
      this.hypercoreSecretKey = null;
    }

    this.notifyListeners(ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE);
  };

  /**
   * Posts a chat message to the circle feed (by the current user)
   * @param chatMessage
   */
  postChatMessageToFeed = chatMessage => {
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
   * Retrieve all messages for the feed
   */
  getAllMessagesForCircleFeed = () => {
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

  //////////// REMOTE CALLBACK HANDLERS  ////////////

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
}
