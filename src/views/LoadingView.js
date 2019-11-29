import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Container,
  Divider,
  Transition,
  Icon,
  Header,
  Progress,
  Segment
} from "semantic-ui-react";

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
    this.animationTime = 500;
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
      progress: this.progress,
      progressVisible: true,
      loginFailedVisible: false,
      loginFailedMsg: ""
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
      ),
      quit: RendererEventFactory.createEvent(
        RendererEventFactory.Events.APP_QUIT,
        this
      )
    };
  }

  onLoadCb(event, arg) {
    console.log("[LoadingView] event -> APPLOADER_LOAD : " + arg.load);
    this.setState(state => {
      this.updateHeaderText(arg.text);
      this.updateProgress(arg.value, arg.total, arg.label);
    });
  }

  ///called when the app loader login failes. updated gui
  onLoginFailedCb(event, arg) {
    console.log(
      "[LoadingView] event -> WINDOW_LOADING_LOGIN_FAILED : login failed"
    );
    setTimeout(() => {
      this.setState({
        progressVisible: false,
        loginFailedMsg: arg.message
      });
    }, this.animationTime * 3);
    setTimeout(() => {
      this.setState({
        loginFailedVisible: true
      });
    }, this.animationTime * 4);
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
  onHideShow = () => {
    this.setState({ visible: !this.state.visible });
  };

  handleQuitAppBtn = () => {
    this.events.quit.dispatch(0, true);
  };

  /// renders the view into our root element of our window
  render() {
    const progressContent = (
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
      </Container>
    );
    const loginFailedContent = (
      <Container textAlign="center" className="loginFailed">
        <Icon size="massive" name="warning circle" color="red" />
        <Header as="h2" inverted>
          <Header.Content>
            Login Failed :(
            <Header.Subheader>{this.state.loginFailedMsg}</Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Container textAlign="center">
          <Button onClick={this.handleQuitAppBtn} size="big" color="red">
            Quit Torchie
          </Button>
        </Container>
      </Container>
    );
    return (
      <Segment basic inverted>
        <Transition
          visible={this.state.progressVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {progressContent}
        </Transition>
        <Transition
          visible={this.state.loginFailedVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {loginFailedContent}
        </Transition>
      </Segment>
    );
  }
}
