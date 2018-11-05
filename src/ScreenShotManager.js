
const {remote, ipcRenderer, desktopCapturer} = window.require('electron');
const electronScreen = remote.screen;
const shell = remote.shell;

const log = remote.require("electron-log");

const fs = window.require('fs');
const os = window.require('os');
const path = window.require('path');

/*
 * This class is used to managed the taking of screenshots in the app.
 * Since this capability has to be called from the renderer process, it works by listening for events
 * from the main process, then triggering the screenshot capture, saving to a file
 */
module.exports = class ScreenShotManager {
  constructor() {
    log.info("[ScreenShotManager] created -> okay");
    this.enabled = false;

    ipcRenderer.on('ping', (event, screenPath) => {

      this.captureScreenShot(screenPath);
      console.log(screenPath)
    });

  }

  //so if take screenshot is pressed,
  //first close the window (renderer to main)
  //main says, okay window is closed, now renderer, take a screenshot (main to renderer)
  //renderer says, okay screenshot is saved, now put screen shot in view, and open the window (renderer to main)
  //main opens window again


  /*
  * Captures a screenshot and saves to ~/.flow/latest_screen.png asynchronously
  * Ideally this will fire an event once the SS is available, but it doesn't do that yet
  */

  captureScreenShot (screenPath) {
    log.info("[ScreenShotManager] capturing new screenshot async");

    let thumbSize = this.determineScreenShotSize();

    log.info("captureScreenShotAsync2");
    let options = {types: ['screen'], thumbnailSize: thumbSize};

    log.info("captureScreenShotAsync3");

    desktopCapturer.getSources(options, (error, sources) => {
      log.info("Capture!!");

      if (error) return console.log(error.message);

      sources.forEach((source) => {

        log.info("Saved!");

        log.info("Saved! : "+source.name);
        if (source.name === 'Entire screen' || source.name === 'Screen 1') {

          fs.writeFile(screenPath, source.thumbnail.toPNG(), (err) => {
            if (err) return console.log(err.message);

            log.info("Saved to "+screenPath);
          })
        }
      })
    });

  }

  determineScreenShotSize() {
    log.info("determineScreenShotSize");

    const primaryDisplay = electronScreen.getPrimaryDisplay();
    const screenSize = primaryDisplay.workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    log.info("determineScreenShotSize done: "+maxDimension);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    }
  }

};
