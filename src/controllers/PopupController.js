import { RendererEventFactory } from "../events/RendererEventFactory";
import { BaseClient } from "../clients/BaseClient";
import { ResourceCircuitController } from "./ResourceCircuitController";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { MemberClient } from "../clients/MemberClient";
import { SidePanelViewController } from "./SidePanelViewController";
import {HotkeyClient} from "../clients/HotkeyClient";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 * used to show popup notifications in the app
 */
export class PopupController {
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

  static getPopupHeader() {
    if (FeatureToggle.isMoovieApp) {
      return "WatchMoovies";
    } else {
      return "FlowInsight";
    }
  }

  onTalkRoomMessage = (event, arg) => {
    if (
      arg.messageType === BaseClient.MessageTypes.WTF_STATUS_UPDATE &&
      arg.data.statusType === ResourceCircuitController.StatusTypes.TEAM_WTF_THRESHOLD &&
      arg.data.learningCircuitDto.ownerId !== MemberClient.me.id
    ) {
      this.showNotificationForWtf(arg.data["learningCircuitDto"]);
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
