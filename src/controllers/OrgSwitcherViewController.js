import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class OrgSwitcherViewController extends ActiveViewController {

  constructor(scope) {
    super(scope);

    this.closeWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_ORG_SWITCHER,
        this
      );
  }

  closeOrgSwitcherWindow() {
    this.closeWindowDispatcher.dispatch({});
  }

}
