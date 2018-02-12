import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import {
  Container,
  Divider,
  Transition,
  Icon,
  Header,
  Progress,
  Segment
} from "semantic-ui-react";

const { remote } = window.require("electron"),
  log = remote.require("electron-log");

//
// This view class is used to show application loading which consists of:
//   1> checking for ner version to update
//   2> downloading update if there is one, auto restart
//   3> load database file into memory
//   4> read user configuration
//   5> authenticate user API-Key if online
//
export default class LoadingView extends Component {
  constructor(props) {
    super(props);
    this.header = {
      title: "Loading Torchie",
      text: "Checking for new version...",
      icon: "hand spock"
    };
    this.progress = {
      color: "violet",
      value: 0,
      total: 4,
      label: "Populating cats and synthesizers"
    };
    this.state = {
      visible: true,
      header: this.header,
      progress: this.progress
    };
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.APPLOADER_LOAD,
        this,
        this.onLoadCb
      ),
      loginFailed: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_LOADING_LOGIN_FAILED,
        this,
        this.onLoginFailedCb
      )
    };
  }

  onLoadCb(event, arg) {
    log.info("[LoadingView] event -> APPLOADER_LOAD : " + arg.load);
    this.setState(state => {
      this.updateHeaderText(arg.text);
      this.updateProgress(arg.value, arg.total, arg.label);
    });
  }

  ///called when the app loader login failes. updated gui
  onLoginFailedCb(event, arg) {
    log.info(
      "[LoadingView] event -> WINDOW_LOADING_LOGIN_FAILED : login failed"
    );
    console.log("login failed");
    console.log(arg);

    /// TODO update the gui according
  }

  /// updates the header text to the loading view
  updateHeaderText(text) {
    this.header.text = text;
    return this.header;
  }

  /// update the progress bar from the state of the event passed
  updateProgress(value, total, label) {
    this.progress.value = value;
    this.progress.total = total;
    this.progress.label = label;
    return this.progress;
  }

  /// toggles the view state to trigger animation on icon
  onHideShow = () => this.setState({ visible: !this.state.visible });

  /// renders the view into our root element of our window
  render() {
    return (
      <Segment basic inverted>
        <Container textAlign="center">
          <Transition
            visible={this.state.visible}
            transitionOnMount
            animation="scale"
            duration={800}
            onHide={this.onHideShow}
            onShow={this.onHideShow}
          >
            <Icon
              size="huge"
              circular
              inverted
              color="violet"
              name={this.state.header.icon}
            />
          </Transition>
          <Header as="h2" inverted>
            <Header.Content>
              {this.state.header.title}
              <Header.Subheader>{this.state.header.text}</Header.Subheader>
            </Header.Content>
          </Header>
        </Container>
        <Divider clearing />
        <Progress
          color={this.state.progress.color}
          value={this.state.progress.value}
          total={this.state.progress.total}
          progress="percent"
          precision={0}
          active
          size="medium"
          inverted
        >
          {this.state.progress.label}
        </Progress>
      </Segment>
    );
  }
}
