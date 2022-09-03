import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class DialogViewController extends ActiveViewController {

  constructor(scope) {
    super(scope);

    this.closeHotkeyWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_HOTKEY_CONFIG,
        this
      );

    this.closePluginDialogWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_PLUGIN_DIALOG,
        this
      );

    this.closeModuleConfigDialogWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_MODULE_DIALOG,
        this
      );

    this.closeOrgSwitcherWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_ORG_SWITCHER,
        this
      );

    this.closeInvitationWindowDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_INVITATION_KEY,
        this
      );

  }

  closeHotkeyWindow() {
    this.closeHotkeyWindowDispatcher.dispatch({});
  }

  closePluginWindow() {
    this.closePluginDialogWindowDispatcher.dispatch({});
  }

  closeModuleConfigWindow() {
    this.closeModuleConfigDialogWindowDispatcher.dispatch({});
  }

  closeOrgSwitcherWindow() {
    this.closeOrgSwitcherWindowDispatcher.dispatch({});
  }

  closeInvitationKeyWindow() {
    this.closeInvitationWindowDispatcher.dispatch({});
  }

}
