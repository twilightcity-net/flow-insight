import React, { Component } from "react";
import {
  Button,
  Divider,
  Header,
  Image,
  Grid,
  Segment
} from "semantic-ui-react";

const electron = window.require('electron');

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootPanelOpenWTF extends Component {


  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing/>
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={10} className="rootLayout">
            <Segment className="wtf" inverted>
              <Grid textAlign="center">
                <Grid.Row verticalAlign="middle">
                  <Grid.Column width={4}>

                  </Grid.Column>
                  <Grid.Column width={12}>
                    <Header as="h1" attached="top" inverted>
                      Session is Open!
                    </Header>

                  </Grid.Column>
                </Grid.Row>
              </Grid>
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
