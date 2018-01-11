import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Divider,
  Icon,
  Image,
  Grid,
  Menu,
  Segment,
  TextArea
} from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootPanelDefault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "wtf"
    };
  }

  onClickScreenshot() {
    console.log("screenshot clicked on");
  }

  handleMenuClick = (e, { name }) => {
    this.setState({ activeItem: name });
    let textArea = document.getElementById(
      "layout-troubleshoot-default-wtf-textarea"
    );
    if (name === "yay") {
      textArea.classList.remove("wtf");
      textArea.classList.add("yay");
    } else {
      textArea.classList.remove("yay");
      textArea.classList.add("wtf");
    }
  };

  /// renders the default troubleshoot component in the console view
  render() {
    const { activeItem } = this.state;
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Divider hidden fitted clearing />
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={10} className="rootLayout">
            <Segment className="wtf" inverted>
              <Grid textAlign="center">
                <Grid.Row verticalAlign="middle">
                  <Grid.Column width={4}>
                    <Icon
                      name={activeItem === "wtf" ? "lightning" : "lab"}
                      size="massive"
                      inverted
                    />
                  </Grid.Column>
                  <Grid.Column width={12}>
                    <Menu
                      widths={2}
                      attached="top"
                      className="typeSelect"
                      inverted
                    >
                      <Menu.Item
                        name="wtf"
                        active={activeItem === "wtf"}
                        onClick={this.handleMenuClick}
                      >
                        <Icon name="bug" size="large" inverted />{" "}
                        <span className="text">WTF! </span>
                      </Menu.Item>
                      <Menu.Item
                        name="yay"
                        active={activeItem === "yay"}
                        onClick={this.handleMenuClick}
                      >
                        <Icon name="hand spock" size="large" inverted />{" "}
                        <span className="text">YAY! </span>
                      </Menu.Item>
                    </Menu>
                    <Segment attached basic inverted>
                      <TextArea
                        className="wtf"
                        id="layout-troubleshoot-default-wtf-textarea"
                        rows={4}
                        placeholder="Rant about what is your current problem your having..."
                      />
                    </Segment>

                    <Button
                      size="big"
                      color={activeItem === "wtf" ? "red" : "violet"}
                      animated="fade"
                      attached="bottom"
                    >
                      <Button.Content visible>
                        {activeItem === "wtf"
                          ? "Start Troubleshooting..."
                          : "Make Discovery"}
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
                label={{
                  as: "a",
                  color: activeItem === "wtf" ? "red" : "violet",
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
