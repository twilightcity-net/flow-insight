import React, { Component } from "react";
import {
  Button,
  Divider,
  Header,
  Image,
  Input,
  Grid,
  Segment
} from "semantic-ui-react";
import ChatBox from "./ChatBox"

const electron = window.require('electron');

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootPanelOriginalOpen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatInputValue: ""
    }
  }

  onClickStopTroubleshooting = () => {
    console.log("on click stop troubleshooting");

    this.props.onStopTroubleshooting();
  };


  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelOpenDefault">
        <Divider hidden fitted clearing/>
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={6} className="rootLayout">
            <Segment className="wtf" inverted>
              <div>
                <ChatBox/>
              </div>

              <Button onClick={this.onClickStopTroubleshooting}
                      size="big"
                      color="purple"
                      animated="fade"
                      attached="bottom">
                <Button.Content visible>
                  Solved!
                </Button.Content>
                <Button.Content hidden>
                  YAY!
                </Button.Content>
              </Button>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6} className="rootLayout">
            <Segment inverted>

            </Segment>
          </Grid.Column>
        </Grid>

      </div>
    );
  }
}
