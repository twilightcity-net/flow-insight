import React, { Component } from "react";
// import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Divider,
  Header,
  Image,
  Grid,
  Segment
} from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootPanelDefault extends Component {
  // constructor(props) {
  //   super(props);
  // }

  onClickScreenshot() {
    console.log("screenshot clicked on");
  }

  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing />
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={10} className="rootLayout">
            <Segment className="wtf" inverted>
              <Grid textAlign="center">
                <Grid.Row verticalAlign="middle">
                  <Grid.Column width={4}>
                    <Image
                      centered
                      src="./assets/images/flame_red_animated.gif"
                    />
                  </Grid.Column>
                  <Grid.Column width={12}>
                    <Header as="h1" attached="top" inverted>
                      W T F!
                    </Header>
                    <Segment attached basic inverted>
                      Let's solve a problem! Click the button below will begin
                      the troubleshooting session. On the next screen describe
                      the problem your having, and the timer will be shown.
                    </Segment>
                    <Button
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
                src="./assets/images/screenshot.png"
                onClick={this.onClickScreenshot}
              />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
