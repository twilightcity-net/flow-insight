import React, {Component} from "react";
// import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Divider,
  Header,
  Icon,
  Image,
  Grid,
  Message,
  Segment,
  TextArea
} from "semantic-ui-react";

const electron = window.require('electron');
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;

const fs = window.require('fs');
const os = window.require('os');
const path = window.require('path');
//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootPanelNewWTF extends Component {
  constructor(props) {
    super(props);
  }

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



  onClickStartTroubleshooting = () => {
    console.log("on click start troubleshooting");

    this.props.onStartTroubleshooting("pass in [what's the problem] input contents");
  };

  onClickScreenshot = () => {
    console.log("screenshot clicked on");

    this.takeScreenShot();
  };

  takeScreenShot = () => {
    let thumbSize = this.determineScreenShotSize();
    let options = {types: ['screen'], thumbnailSize: thumbSize};

    desktopCapturer.getSources(options, (error, sources) => {
      if (error) return console.log(error.message);

      sources.forEach((source) => {

        console.log("Saved!");

        console.log("Saved! : " + source.name);
        if (source.name === 'Entire screen' || source.name === 'Screen 1') {


          const screenPath = path.join(os.tmpdir(), 'screenshot.png');

          fs.writeFile(screenPath, source.thumbnail.toPNG(), (err) => {
            if (err) return console.log(err.message);

            shell.openExternal('file://' + screenPath);

            console.log("Saved to " + screenPath);
          })
        }
      })
    });
  };

  determineScreenShotSize = () => {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    }
  };


  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing/>
        <Grid textAlign="center" inverted>
          <Grid.Row verticalAlign="top">
            <Grid.Column width={8} className="rootLayout">
              <Grid textAlign="left">
                <Grid.Row verticalAlign="top">
                  <Grid.Column width={12}>
                    <Header as="h1" attached="top" inverted>
                      W T F!
                    </Header>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row textAlign="center">
                  <Message className="troubleshootPanelMessage"
                           content="Need some insight? Start collecting clues in your scrapbook, and get help with your team!"/>
                </Grid.Row>
                <Grid.Row className="troubleshootPanelInputBox">
                  <Grid.Column width={4}>
                    <Image
                      centered
                      size="small"
                      src="./assets/images/flame_red_animated.gif"
                    />
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <TextArea
                      className="troubleshootPanelTextbox"
                      placeholder="What's the problem?"
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12}>
                    <Button onClick={this.onClickStartTroubleshooting}
                            size="big"
                            color="red"
                            animated="fade"
                            attached="bottom"
                    >
                    <Button.Content visible>
                      Start Troubleshooting...
                    </Button.Content>
                    <Button.Content hidden>
                      click here to continue
                    </Button.Content>
                    </Button>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
            <Grid.Column width={6} className="rootLayout screenshot" textAlign="justified">
              <Grid.Row>
              <Segment inverted compact>
                <Header as="h1" attached="top" icon inverted>
                  {/* This is the icon to be switched to, right now it deletes the red "Start Troubleshooting" button though */}
                  {/*<Icon name="camera" size="massive"*/}
                        {/*className="screenshot"*/}
                        {/*onClick={() => this.onClickScreenshot()}*/}
                  {/*/>*/}
                  Troubleshooting Scrapbook
                </Header>
                <Image
                  fluid
                  className="screenshot"
                  label={{
                    as: "a",
                    color: "red",
                    corner: "right",
                    icon: "external"
                  }}
                  src="./assets/images/screenshot.png"
                  onClick={this.onClickScreenshot}
                />
              </Segment>
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
