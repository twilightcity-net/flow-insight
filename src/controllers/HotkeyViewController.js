import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class HotkeyViewController extends ActiveViewController {

  constructor(scope) {
    super(scope);

    this.closeWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_HOTKEY_CONFIG,
        this
      );
  }

  closeHotkeyWindow() {
    this.closeWindowDispatcher.dispatch({});
  }

}
