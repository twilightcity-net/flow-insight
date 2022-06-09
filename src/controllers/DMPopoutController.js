import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class DMPopoutController extends ActiveViewController {

  constructor(scope) {
    super(scope);

    this.openDMDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_OPEN_DM,
        this
      );

    this.closeDMDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_DM,
        this
      );
  }

  /**
   * Opens a popup DM for a specific memberId
   * @param memberId
   */
  openDMForMember(memberId) {
    console.log("memberId to open DM: " + memberId);
    this.openDMDispatcher.dispatch({
      memberId: memberId
    });
  }


  /**
   * Close a popup DM for a specific memberId
   * @param memberId
   */
  closeDMForMember(memberId) {
    console.log("memberId to close DM: " + memberId);
    this.closeDMDispatcher.dispatch({
      memberId: memberId
    });
  }

}
