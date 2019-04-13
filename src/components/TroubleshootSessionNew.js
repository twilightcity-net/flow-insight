import React, { Component } from "react";
// import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Divider,
  Header,
  Image,
  Grid,
  Segment,
  Input
} from "semantic-ui-react";
import { RendererEventFactory } from "../RendererEventFactory";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { DataModelFactory } from "../models/DataModelFactory";

const electron = window.require("electron");
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const fs = window.require("fs");

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootSessionNew extends Component {
  constructor(props) {
    super(props);
    this.name = "[TroubleshootSessionNew]";

    this.state = {
      screenPath: "./assets/images/screenshot.png",
      currentProblem: "",
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

  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");
    this.activeCircleModel.registerListener(
      "TroubleshootSessionNew",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
  };

  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.activeCircleModel.unregisterAllListeners("TroubleshootSessionNew");
  };

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

  onReadyForScreenShot = (event, arg) => {
    console.log("ready for ss");
    console.info("ready for ss:" + arg);

    this.takeScreenShot(arg);
  };

  handleChangeForProblem = (e, { name, value }) => {
    this.setState({ currentProblem: value });
  };

  onClickStartTroubleshooting = () => {
    console.log("start trouble" + this.state.currentProblem);

    if (
      this.state.currentProblem != null &&
      this.state.currentProblem.length > 0
    ) {
      console.log("HERE WE GO!");
      this.props.onStartTroubleshooting(this.state.currentProblem);
    }
  };

  onClickScreenshot = () => {
    console.log("screenshot clicked on");

    this.events.prepareForScreenShot.dispatch(0, true);
  };

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

  determineScreenShotSize = () => {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    };
  };

  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing />
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={10} className="rootLayout">
            <Segment className="wtf" inverted>
              <Header as="h1" attached="top" inverted>
                {this.state.circleOwner}'s Troubleshooting Scrapbook
              </Header>
              <Segment attached basic inverted>
                Let's solve a problem! Take a screenshot and describe the
                situation below. Once you start the session, a timer will begin
                on the next screen. Look for clues to collect in your scrapbook,
                and get help from your team!
              </Segment>

              <Segment attached basic inverted>
                <Input
                  id="problemDescription"
                  className="intentionText"
                  value={this.state.currentProblem}
                  onChange={this.handleChangeForProblem}
                  fluid
                  inverted
                  placeholder="What's the problem?"
                />
              </Segment>
              <Button
                onClick={this.onClickStartTroubleshooting}
                size="big"
                color="red"
                animated="fade"
                attached="bottom"
              >
                <Button.Content visible>
                  Start Troubleshooting...
                </Button.Content>
                <Button.Content hidden>Go!</Button.Content>
              </Button>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6} className="rootLayout screenshot">
            <Segment inverted>
              <Image
                fluid
                className="screenshot"
                label={{
                  as: "a",
                  color: "red",
                  corner: "right",
                  icon: "external"
                }}
                src={this.state.screenPath}
                onClick={this.onClickScreenshot}
              />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
