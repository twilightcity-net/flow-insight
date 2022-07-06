import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class InvitationViewController extends ActiveViewController {

  constructor(scope) {
    super(scope);

    this.closeWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_INVITATION_KEY,
        this
      );
  }

  closeInvitationKeyWindow() {
    this.closeWindowDispatcher.dispatch({});
  }

}
