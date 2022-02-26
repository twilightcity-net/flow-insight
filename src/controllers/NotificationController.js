import { RendererEventFactory } from "../events/RendererEventFactory";
import { BaseClient } from "../clients/BaseClient";
import { ResourceCircuitController } from "./ResourceCircuitController";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { MemberClient } from "../clients/MemberClient";

/**
 * used to show notifications in the app
 */
export class NotificationController {
  static notifyHeader = "FlowInsight";

  constructor(scope) {
    this.scope = scope;

    this.hasNeverBeenOpen = true;
    this.isGettingStartedPopupOpen = false;
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.consoleViewListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_CONSOLE_SHOW_HIDE,
        this,
        this.onConsoleShowHide
      );

    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
  }

  onTalkRoomMessage = (event, arg) => {
    if (
      arg.messageType ===
        BaseClient.MessageTypes.WTF_STATUS_UPDATE &&
      arg.data.statusType ===
        ResourceCircuitController.StatusTypes
          .TEAM_WTF_THRESHOLD &&
      arg.data.ownerId === MemberClient.me.id
    ) {
      this.showNotificationForWtf(
        arg.data["learningCircuitDto"]
      );
    }
  };

  /**
   * When a team member is troubleshooting for a long period of time, send a popup notification that
   * allows the user to navigate to the member's troubleshooting session.
   * @param circuit
   */
  showNotificationForWtf(circuit) {
    let msg =
      circuit.ownerName +
      " has been troubleshooting for over 20 minutes, maybe you can help?";
    let n = NotificationController.showNotification(
      "Friction Alarm",
      msg,
      () => {
        let request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.CIRCUIT,
          circuit.circuitName
        );

        setTimeout(() => {
          if (this.consoleIsCollapsed) {
            this.consoleViewListener.dispatch({
              showHideFlag: 0,
            });
          }
          this.browserController.makeRequest(request);
        }, 420);
      }
    );
    setTimeout(() => {
      n.close();
    }, 60000);
  }

  /**
   * The first notification popup to let you know how to open the console when the application starts.
   * Initially, notifications are disabled, and so the first popup, triggers a permission request to allow popups,
   * while suppressing the first popup.
   *
   * If the user still hasn't opened up the console yet, in case the first popup was supressed, send one more.
   */
  showGettingStartedNotification() {
    setTimeout(() => {
      this.tryAgainToShowPopup();
    }, 2500);
  }

  /**
   * Since our popups may be blocked, we may need to wait for permission to show the first popup
   */
  tryAgainToShowPopup() {
    if (
      this.hasNeverBeenOpen &&
      Notification.permission !== "blocked"
    ) {
      if (!this.isGettingStartedPopupOpen) {
        this.showGettingStartedPopupAndAutoClose();
      }
      setTimeout(() => {
        this.tryAgainToShowPopup();
      }, 10000);
    }
  }

  showGettingStartedPopupAndAutoClose() {
    this.isGettingStartedPopupOpen = true;
    let n = this.showNotification(
      "FlowInsight",
      "Press ctrl ~ to open the console."
    );
    n.onclose = () => {
      this.isGettingStartedPopupOpen = false;
    };
    setTimeout(() => {
      n.close();
    }, 30000);
  }

  showNotification(title, body, callback) {
    let options = {
      silent: true,
      body: body,
    };

    let n = new Notification(title, options);

    n.onclick = () => {
      if (callback) {
        callback();
      }
    };
    return n;
  }

  onConsoleShowHide(event, arg) {
    this.consoleIsCollapsed = arg.showHideFlag;
    this.hasNeverBeenOpen = false;
  }
}
