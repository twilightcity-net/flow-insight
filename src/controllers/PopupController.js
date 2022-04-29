import { RendererEventFactory } from "../events/RendererEventFactory";
import { BaseClient } from "../clients/BaseClient";
import { ResourceCircuitController } from "./ResourceCircuitController";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { MemberClient } from "../clients/MemberClient";
import { SidePanelViewController } from "./SidePanelViewController";

/**
 * used to show popup notifications in the app
 */
export class PopupController {
  static notifyHeader = "FlowInsight";

  constructor(scope) {
    this.scope = scope;

    this.hasNeverBeenOpen = true;
    this.isGettingStartedPopupOpen = false;
    this.initialPopup = null;

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.directMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_CLIENT,
        this,
        this.onTalkDirectMessage
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

  onTalkDirectMessage = (event, arg) => {
    if (
      arg.messageType ===
      BaseClient.MessageTypes.PAIRING_REQUEST
    ) {
      if (
        arg.data.pairingRequestType ===
        BaseClient.PairingRequestTypes.PAIRING_REQUEST
      ) {
        this.showNotificationForPairingRequest(arg.data);
      }
    }
  };

  /**
   * When another team member requests to pair with us (or pair with our current pairing team)
   * we get a notification popup requesting to confirm whether this is okay.
   *
   * @param pairingRequest
   */
  showNotificationForPairingRequest(pairingRequest) {
    console.log("showNotificationForPairingRequest");

    let msg =
      pairingRequest.fromDisplayName +
      " would like to pair with you. Confirm to join.";
    let n = PopupController.showNotification(
      "Pairing Request",
      msg,
      () => {
        console.log("Do an action for the pairing request");

        this.myController =
          RendererControllerFactory.getViewController(
            RendererControllerFactory.Views.CONSOLE_SIDEBAR
          );

        let request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.JOURNAL,
          pairingRequest.fromUsername
        );

        setTimeout(() => {
          if (this.consoleIsCollapsed) {
            this.consoleViewListener.dispatch({
              showHideFlag: 0,
            });
          }
          this.browserController.makeRequest(request);
          this.myController.showPanel(
            SidePanelViewController.MenuSelection
              .NOTIFICATIONS
          );
        }, 111);
      }
    );
    setTimeout(() => {
      n.close();
    }, 60000);
  }

  /**
   * When a team member is troubleshooting for a long period of time, send a popup notification that
   * allows the user to navigate to the member's troubleshooting session.
   * @param circuit
   */
  showNotificationForWtf(circuit) {
    let msg =
      circuit.ownerName +
      " has been troubleshooting for over 20 minutes, maybe you can help?";
    let n = PopupController.showNotification(
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
      this.tryAgainToShowGettingStartedPopup();
    }, 2500);
  }

  /**
   * Since our popups may be blocked, we may need to wait for permission to show the first popup
   */
  tryAgainToShowGettingStartedPopup() {
    if (
      this.hasNeverBeenOpen &&
      Notification.permission !== "blocked"
    ) {
      if (!this.isGettingStartedPopupOpen) {
        this.initialPopup =
          this.showGettingStartedPopupAndAutoClose();
      }
      setTimeout(() => {
        this.tryAgainToShowGettingStartedPopup();
      }, 10000);
    }
  }

  showGettingStartedPopupAndAutoClose() {
    this.isGettingStartedPopupOpen = true;
    let n = PopupController.showNotification(
      "FlowInsight",
      "Press ctrl ~ to open the console."
    );
    n.onclose = () => {
      this.isGettingStartedPopupOpen = false;
    };
    setTimeout(() => {
      n.close();
    }, 30000);

    return n;
  }

  static showNotification(title, body, callback) {
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

    if (
      !this.consoleIsCollapsed &&
      this.initialPopup != null
    ) {
      this.initialPopup.close();
      this.initialPopup = null;
    }
  }
}
