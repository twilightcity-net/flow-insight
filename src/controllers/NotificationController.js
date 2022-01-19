import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import {ResourceCircuitController} from "./ResourceCircuitController";
import {BrowserRequestFactory} from "./BrowserRequestFactory";
import {RendererControllerFactory} from "./RendererControllerFactory";
import {MemberClient} from "../clients/MemberClient";

/**
 * used to show notifications in the app
 */
export class NotificationController  {

  static notifyHeader = 'FlowInsight';

  constructor(scope) {
    this.scope = scope;

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

  onConsoleShowHide(event, arg) {
    this.consoleIsCollapsed = arg.showHideFlag;
  }

  onTalkRoomMessage = (event, arg) => {
    if (arg.messageType === BaseClient.MessageTypes.WTF_STATUS_UPDATE
      && arg.data.statusType === ResourceCircuitController.StatusTypes.TEAM_WTF_THRESHOLD &&
      arg.data.ownerId === MemberClient.me.id
    ) {
      this.sendNotificationForWtf(arg.data["learningCircuitDto"]);
    }
  }

  sendNotificationForWtf(circuit) {
    if (!this.consoleIsCollapsed ) {
      //TODO add notifications on the side menu, even if we do a popup here when the console is closed.
      return;
    }
    let msg = circuit.ownerName + " has been troubleshooting for over 20 minutes, maybe you can help?";
    NotificationController.showNotification('Friction Alarm', msg, () => {
      let request =
        BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.TROUBLESHOOT,
          circuit.circuitName
        );

      setTimeout(() => {
        this.consoleViewListener.dispatch({showHideFlag: 0});
        this.browserController.makeRequest(request);
      }, 420);
    });
  }

  static showGettingStartedNotification() {
    setTimeout( () => {
        let n = NotificationController.showNotification('FlowInsight', 'Press ctrl ~ to open the console.');
        setTimeout(() => {
            n.close();
          }, 4000
        );
      }, 3000
    )
  }


  static showNotification(title, body, callback) {
    let options = {
      silent: true,
      body: body
    }

    let n = new Notification(title, options);

    n.onclick = () => {
      if (callback) {
        callback();
      }
    }
    return n;
  }
}
