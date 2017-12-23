import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import {
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
  /// toggles the view state to trigger animation on icon
  onHideShow = () => this.setState({ visible: !this.state.visible });

  constructor(props) {
    super(props);
    this.header = {
      title: "Staring MetaOS",
      text: "Checking for new version...",
      icon: "hand spock"
    };
    this.progress = {
      color: "violet",
      value: 0,
      total: 3,
      label: "Populating cats and synthesizers"
    };
    this.state = {
      visible: true,
      header: this.header,
      progress: this.progress
    };
    this.events = {
      load: new RendererEvent(
        RendererEventManagerHelper.Events.APPLOADER_LOAD,
        this,
        function(event, arg) {
          console.log("[LoadingView] event -> " + this.type + " : " + arg.load);
          this.scope.setState(state => {
            this.scope.updateHeaderText(arg.text);
            this.scope.updateProgress(arg.value, arg.total, arg.label);
          });
        }
      )
    };
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

  /// renders the view into our root element of our window
  render() {
    return (
      <Segment basic>
        <Container>
          <Header as="h4" floated="left">
            <Transition
              visible={this.state.visible}
              transitionOnMount
              animation="scale"
              duration={800}
              onHide={this.onHideShow}
              onShow={this.onHideShow}
            >
              <Icon
                size="big"
                circular
                inverted
                color="violet"
                name={this.state.header.icon}
              />
            </Transition>
          </Header>
          <Header as="h3" floated="left">
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
          size="small"
        >
          {this.state.progress.label}
        </Progress>
      </Segment>
    );
  }
}
