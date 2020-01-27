import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class ConsoleViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.consoleIsCollapsed = true;

    this.consoleLayoutlListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );

    this.consoleViewListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );

    this.teamPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOWN,
      this
    );

    this.journalLayoutListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOWN,
      this
    );

    this.journalEntryListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );

    this.modelUpdateListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );

    this.myListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this,
      this.onUpdateState
    );
  }

  //FIXME do we need???
  configureConsoleLayoutListener(scope, callback) {
    this.consoleLayoutlListener.updateCallback(scope, callback);
  }

  configureConsoleViewListener(scope, callback) {
    this.consoleViewListener.updateCallback(scope, callback);
  }

  configureTeamPanelListener(scope, callback) {
    this.teamPanelListener.updateCallback(scope, callback);
  }

  configureJournalLayoutListener(scope, callback) {
    this.journalLayoutListener.updateCallback(scope, callback);
  }

  configureJournalEntryListener(scope, callback) {
    this.journalEntryListener.updateCallback(scope, callback);
  }

  configureModelUpdateListener(scope, callback) {
    this.modelUpdateListener.updateCallback(scope, callback);
  }

  onUpdateState(event, showHideFlag) {
    this.consoleIsCollapsed = showHideFlag;
  }
}
