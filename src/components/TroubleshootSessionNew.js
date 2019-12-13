import React, { Component } from "react";
import { Button, Divider, Segment, Transition } from "semantic-ui-react";
import { RendererEventFactory } from "../RendererEventFactory";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { DataModelFactory } from "../models/DataModelFactory";

const electron = window.require("electron");
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const fs = window.require("fs");

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TroubleshootSessionNew extends Component {
  /**
   * the constructor function that is called when creating a new TroubleshootSession
   * @param props - properties that are passed in from the troubleshoot layout
   */
  constructor(props) {
    super(props);
    this.name = "[TroubleshootSessionNew]";

    this.state = {
      screenPath: "./assets/images/screenshot.png",
      activeCircle: null,
      circleName: null,
      circleOwner: "Me"
    };

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

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
  }

  /**
   * called when the component first mounts
   */
  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");
    this.activeCircleModel.registerListener(
      "TroubleshootSessionNew",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
  };

  /**
   * called when the component is hidden
   */
  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.activeCircleModel.unregisterAllListeners("TroubleshootSessionNew");
  };

  /**
   * local scoped callback that is called when the active circle needs updating
   */
  onCircleUpdate = () => {
    console.log(this.name + " - onCircleUpdate");

    this.setState({
      activeCircle: this.activeCircleModel.getActiveScope().activeCircle,
      circleName: this.activeCircleModel.getActiveScope().circleName,
      circleOwner: this.activeCircleModel.getActiveScope().getCircleOwner()
    });
  };

  //so the thing we want to do, is everytime the console opens, before it automatically opens,
  //there's an async call made to capture a screenshot, and write it to .flow/latest_capture.png

  //then the torchie app here, should display whatever is in latest screen
  //the content of latest screen should be refreshed whenever the troubleshooting window is re-rendered
  //if no SS is available, will be black, hopefully there will be a SS in the directory

  //these files are only sent to the server if "start troubleshooting is pressed"

  //opening the expanded window... should open the SS in a shell

  //so I can probably put this code in the console window itself, and make a SS helper object
  //that I can import?  I'll refactor this out later, first just make it work

  // then want to make it so clicking "start troubleshooting" sets an alarm on the server that starts a counter

  onScreenShotReadyForDisplay = (event, screenPath) => {
    console.info("ready for display:" + screenPath);

    this.setState({
      screenPath: "file://" + screenPath
    });
  };

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
   * click handler for the wtf button. starts a session through a prop ref
   */
  onClickStartTroubleshooting = () => {
    console.log("start troubleshooting");

    this.props.onStartTroubleshooting();
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
   * capture the screen
   * @param screenPath
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
   * figured out the size of the screen to take a screen shot
   * @returns {{width: number, height: number}}
   */
  determineScreenShotSize = () => {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    };
  };

  /**
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing />
        <Segment textAlign={"center"} className="wtf" inverted padded={"very"}>
          <div
            className="wtf-button-massive"
            onClick={this.onClickStartTroubleshooting}
          >
            WTF!
          </div>
          {/*<Button*/}
          {/*  onClick={this.onClickStartTroubleshooting}*/}
          {/*  size="massive"*/}
          {/*  color="red"*/}
          {/*  animated="fade"*/}
          {/*  className="reallyfuckingbig"*/}
          {/*>*/}
          {/*  <Button.Content visible>*/}
          {/*    &nbsp;&nbsp;&nbsp; WTF?!&nbsp;&nbsp;&nbsp;*/}
          {/*  </Button.Content>*/}
          {/*  <Button.Content hidden>*/}
          {/*    &nbsp;&nbsp;&nbsp;HELP!&nbsp;&nbsp;&nbsp;*/}
          {/*  </Button.Content>*/}
          {/*</Button>*/}
          <Segment inverted size={"huge"} className="wtf-button-desc">
            <b>Start A Troubleshooting Session?</b>
          </Segment>
        </Segment>
      </div>
    );
  }
}
