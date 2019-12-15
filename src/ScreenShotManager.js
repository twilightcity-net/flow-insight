import { RendererEventFactory } from "./RendererEventFactory";

// FIXME this is a security issue, should be handled in the main process

const { remote, ipcRenderer, desktopCapturer, electron } = window.require(
  "electron"
);
const log = remote.require("electron-log");
const electronScreen = electron.screen;
const fs = window.require("fs");

/**
 *  This class is used to managed the taking of screenshots in the app.
 * Since this capability has to be called from the renderer process, it works by listening for events
 * from the main process, then triggering the screenshot capture, saving to a file
 */
export class ScreenShotManager {
  constructor() {
    log.info("[ScreenShotManager] created -> okay");
    this.enabled = false;
    this.state = {
      screenPath: "./assets/images/screenshot.png"
    };

    ipcRenderer.on("ping", (event, screenPath) => {
      this.captureScreenShot(screenPath);
      console.log(screenPath);
    });

    this.events = {
      prepareForScreenShot: RendererEventFactory.createEvent(
        RendererEventFactory.Events.PREPARE_FOR_SCREENSHOT,
        this
      ),
      readyForScreenShot: RendererEventFactory.createEvent(
        RendererEventFactory.Events.READY_FOR_SCREENSHOT,
        this,
        (event, arg) => this.onReadyForScreenShot(event, arg)
      ),
      screenShotComplete: RendererEventFactory.createEvent(
        RendererEventFactory.Events.SCREENSHOT_COMPLETE,
        this
      ),
      screenReadyForDisplay: RendererEventFactory.createEvent(
        RendererEventFactory.Events.SCREENSHOT_READY_FOR_DISPLAY,
        this,
        (event, arg) => this.onScreenShotReadyForDisplay(event, arg)
      )
    };
  }

  /**
   * called when the console is ready to take a screen shot.
   * @param event
   * @param arg
   */
  onReadyForScreenShot = (event, arg) => {
    console.log("ready for ss");
    console.info("ready for ss:" + arg);

    this.takeScreenShot(arg);
  };

  /**
   * so the thing we want to do, is everytime the console opens, before it automatically opens,
   * there's an async call made to capture a screenshot, and write it to .flow/latest_capture.png
   * then the torchie app here, should display whatever is in latest screen
   * the content of latest screen should be refreshed whenever the troubleshooting window is re-rendered
   * if no SS is available, will be black, hopefully there will be a SS in the directory
   * these files are only sent to the server if "start troubleshooting is pressed"
   * opening the expanded window... should open the SS in a shell
   * so I can probably put this code in the console window itself, and make a SS helper object that I can import?
   * I'll refactor this out later, first just make it work
   * then want to make it so clicking "start troubleshooting" sets an alarm on the server that starts a counter
   * @param event - the event that was dispatched
   * @param screenPath - the path to save the screenshot into
   */
  onScreenShotReadyForDisplay = (event, screenPath) => {
    console.info("ready for display:" + screenPath);

    this.setState({
      screenPath: "file://" + screenPath
    });
  };

  /**
   * so if take screenshot is pressed, first close the window (renderer to main) main says, okay window is closed,
   * now renderer, take a screenshot (main to renderer) renderer says, okay screenshot is saved, now put screen shot
   * in view, and open the window (renderer to main) main opens window again
   * Captures a screenshot and saves to ~/.flow/latest_screen.png asynchronously
   * Ideally this will fire an event once the SS is available, but it doesn't do that yet
   * @param screenPath - the path to save the screenshot to
   */
  captureScreenShot(screenPath) {
    log.info("[ScreenShotManager] capturing new screenshot async");

    let thumbSize = this.determineScreenShotSize();

    log.info("captureScreenShotAsync2");
    let options = { types: ["screen"], thumbnailSize: thumbSize };

    log.info("captureScreenShotAsync3");

    desktopCapturer.getSources(options, (error, sources) => {
      log.info("Capture!!");

      if (error) return console.log(error.message);

      sources.forEach(source => {
        log.info("Saved!");

        log.info("Saved! : " + source.name);
        if (source.name === "Entire screen" || source.name === "Screen 1") {
          fs.writeFile(screenPath, source.thumbnail.toPNG(), err => {
            if (err) return console.log(err.message);

            log.info("Saved to " + screenPath);
          });
        }
      });
    });
  }

  /**
   * capture the screen
   * @param screenPath - the path to save the screne to
   */
  takeScreenShot = screenPath => {
    let thumbSize = this.determineScreenShotSize();
    let options = { types: ["screen"], thumbnailSize: thumbSize };

    desktopCapturer.getSources(options, (error, sources) => {
      if (error) return console.log(error.message);

      sources.forEach(source => {
        console.log("Saved!");

        console.log("Saved! : " + source.name);
        if (source.name === "Entire screen" || source.name === "Screen 1") {
          //const screenPath = window.require("path").join(window.require("os").tmpdir(), 'screenshot.png');

          // FIXME: this should be handled by the main process, potential security issue

          fs.writeFile(screenPath, source.thumbnail.toPNG(), err => {
            if (err) return console.log(err.message);

            //electron.shell.openExternal('file://' + screenPath);

            console.info("saved");
            this.events.screenShotComplete.dispatch(screenPath, true);

            console.log("Saved to " + screenPath);
          });
        }
      });
    });
  };

  /**
   * csllback for when the screenshot is clicked on
   * @deprecated
   */
  onClickScreenshot = () => {
    console.log("screenshot clicked on");

    this.events.prepareForScreenShot.dispatch(0, true);
  };

  /**
   * figured out the size of the screen to take a screen shot
   * @returns {{width: number, height: number}}
   */
  determineScreenShotSize = () => {
    log.info("determineScreenShotSize");

    const primaryDisplay = electronScreen.getPrimaryDisplay();
    const screenSize = primaryDisplay.workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    log.info("determineScreenShotSize done: " + maxDimension);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    };
  };
}
