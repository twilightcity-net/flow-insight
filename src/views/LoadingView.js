import React, { Component } from "react";
import { RendererEventFactory } from "../events/RendererEventFactory";
import {
  Button,
  Container,
  Divider,
  Header,
  Icon,
  Progress,
  Segment,
  Transition,
} from "semantic-ui-react";

/**
 *  This view class is used to show application loading which consists of:
 *
 *  1> checking for ner version to update
 *  2> downloading update if there is one, auto restart
 *  3> load database file into memory
 *  4> read user configuration
 *  5> authenticate user API-Key if online
 */
export default class LoadingView extends Component {
  constructor(props) {
    super(props);
    this.animationTime = 500;
    this.header = {
      title: "Flow Insight",
      text: "Loading...",
      icon: "hand spock outline",
    };
    this.progress = {
      color: "violet",
      value: 0,
      total: 3,
      label: "Populating cats and synthesizers",
    };
    this.state = {
      appVersion: "spark_0.5.12",
      visible: true,
      header: this.header,
      progress: this.progress,
      progressVisible: true,
      loginFailedVisible: false,
      loginFailedMsg: "",
      talkFailedVisible: false,
      talkFailedMsg: "",
    };
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.APPLOADER_LOAD,
        this,
        this.onLoadCb
      ),
      loginFailed: RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_LOADING_LOGIN_FAILED,
        this,
        this.onLoginFailedCb
      ),
      talkFailed: RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_CONNECT_FAILED,
        this,
        this.onTalkFailedCb
      ),
      quit: RendererEventFactory.createEvent(
        RendererEventFactory.Events.APP_QUIT,
        this
      ),
    };
  }

  /**
   * event listener that is notified when the app view is reloaded or loaded with a new state
   * @param event
   * @param arg
   */
  onLoadCb(event, arg) {
    console.log(
      "[LoadingView] event -> APPLOADER_LOAD : " + arg.load
    );
    this.setState((state) => {
      this.updateHeaderText(arg.text);
      this.updateProgress(arg.value, arg.total, arg.label);
    });
  }

  /**
   * called when the app loader login fails. updated gui
   * @param event
   * @param arg
   */
  onLoginFailedCb(event, arg) {
    console.log(
      "[LoadingView] event -> WINDOW_LOADING_LOGIN_FAILED : login failed"
    );
    setTimeout(() => {
      this.setState({
        progressVisible: false,
        loginFailedMsg: arg.message,
      });
    }, this.animationTime * 3);
    setTimeout(() => {
      this.setState({
        loginFailedVisible: true,
      });
    }, this.animationTime * 4);
  }

  /**
   * called when the app loader talk fails. updated gui
   * @param event
   * @param arg
   */
  onTalkFailedCb(event, arg) {
    console.log(arg);
    console.error("[LoadingView] talk failed : " + event);
    setTimeout(() => {
      this.setState({
        progressVisible: false,
        talkFailedMsg: arg.message,
      });
    }, this.animationTime * 3);
    setTimeout(() => {
      this.setState({
        talkFailedVisible: true,
      });
    }, this.animationTime * 4);
  }

  /**
   * updates the header text to the loading view
   * @param text
   * @returns {{icon: string, text: string, title: string}}
   */
  updateHeaderText(text) {
    this.header.text = text;
    return this.header;
  }

  /**
   * update the progress bar from the state of the event passed
   * @param value
   * @param total
   * @param label
   * @returns {{total: number, color: string, label: string, value: number}}
   */
  updateProgress(value, total, label) {
    this.progress.value = value;
    this.progress.total = total;
    this.progress.label = label;
    return this.progress;
  }

  /**
   * toggles the view state to trigger animation on icon
   */
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
            className="icon-loading"
            name={this.state.header.icon}
          />
        </Transition>
        <Header as="h2" inverted>
          <Header.Content>
            <Header.Subheader></Header.Subheader>
          </Header.Content>
        </Header>
        <Progress
          color={this.state.progress.color}
          value={this.state.progress.value}
          total={this.state.progress.total}
          precision={0}
          active
          size="tiny"
          inverted
          align="center"
        >
          {this.state.header.text}
        </Progress>
      </Container>
    );
    const loginFailedContent = (
      <Container textAlign="center" className="loginFailed">
        <Icon
          size="massive"
          name="warning circle"
          color="red"
        />
        <Header as="h2" inverted>
          <Header.Content>
            Sorry, Authentication Error :(
            <Header.Subheader>
              {this.state.loginFailedMsg}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Container textAlign="center">
          <Button
            onClick={this.handleQuitAppBtn}
            size="big"
            color="red"
          >
            Quit
          </Button>
        </Container>
      </Container>
    );
    const talkFailedContent = (
      <Container textAlign="center" className="talkFailed">
        <Icon
          size="massive"
          name="warning circle"
          color="red"
        />
        <Header as="h2" inverted>
          <Header.Content>
            Sorry, Connection Offline :(
            <Header.Subheader>
              {this.state.talkFailedMsg}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Container textAlign="center">
          <Button
            onClick={this.handleQuitAppBtn}
            size="big"
            color="red"
          >
            Quit
          </Button>
        </Container>
      </Container>
    );
    let videoPosterSrc = "./assets/images/TC_intro.png",
      videoSrc = "./assets/video/TC_intro.mp4",
      videoType = "video/mp4";
    return (
      <Container className="loading">
        <div className="fullscreen-bg">
          <video
            muted
            autoPlay
            poster={videoPosterSrc}
            className="fullscreen-bg__video"
          >
            <source src={videoSrc} type={videoType} />
          </video>
        </div>
        <Segment basic inverted className="progress">
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
          <Transition
            visible={this.state.talkFailedVisible}
            animation="vertical flip"
            duration={this.animationTime}
            unmountOnHide
          >
            {talkFailedContent}
          </Transition>
          <div className="appVersion">
            v. {this.state.appVersion}{" "}
          </div>
        </Segment>
      </Container>
    );
  }
}
