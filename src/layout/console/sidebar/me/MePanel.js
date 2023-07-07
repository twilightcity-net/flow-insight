import React, {Component} from "react";
import {Icon, List, Menu, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
/**
 * this component is the side panel for the individual's home page
 * when the FlowInsight for individuals mode is active
 */
export default class MePanel extends Component {
  /**
   * the graphical name of this component in the DOM
   * @type {string}
   */
  static className = "meContent";

  /**
   * builds the me panel
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[MePanel]";
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );
  }


  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
  loadState() {
    return {
      activeItem: SidePanelViewController.SubmenuSelection.ME,
      meVisible: false,
      animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
      animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
      title: "",
    };
  }

  /**
   * attach our listeners to this component from our controller class
   */
  componentDidMount = () => {
    this.myController.configureHomePanelListener(
      this,
      this.onRefreshMePanel
    );
    this.onRefreshMePanel();
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
  };


  onRefreshMePanel = () => {
    console.log("me!");
    MemberClient.getMe(this, (arg) => {
      if (arg.error) {
        console.error("Error while fetching me:"+ arg.error);
      } else {
        this.setState({
          me: arg.data,
          activeItem: SidePanelViewController.SubmenuSelection.ME,
          meVisible: true,
        });
      }
    } );
  }


  /**
   * updates display to show me content
   * @param e
   * @param name
   */
  handleMeClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      meVisible: true,
    });
  };


  getMyStatusBar() {
    let displayName = "";
    if (this.state.me) {
      displayName = this.state.me.displayName;
    }

    return (
      <div className={"meStatus"}>
        <div className="flow">
          <Icon className="flow" name="circle" color="violet" />
          <span className="flowLabel">Flow State:</span>
        </div>

        <div className="name">{displayName}</div>
      </div>
    );
  }


  getMyActiveTask() {
    let activeTaskName = "";
    let activeTaskDescription = "";

    if (this.state.me) {
      activeTaskName = this.state.me.activeTaskName;
      activeTaskDescription = this.state.me.activeTaskSummary;
    }

    if (!activeTaskName) {
      return (<div></div>);
    } else {
      return (
        <div className={"meActiveTask"}>
          <div className="taskName">
            {activeTaskName}
          </div>
          <div className="description">
            {activeTaskDescription}
          </div>

          <div className="status">Active</div>
        </div>
      );
    }
  }

  /**
   * gets the me content panel for the sidebar
   * @returns {*}
   */
  getMeContent = () => {
    let content = "";

    content = (
      <div className={MePanel.className}>
        {this.getMyStatusBar()}
      </div>
    );

    return content;
  };





  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel mePanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity,
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name="my status"
              active={true}
              onClick={this.handleMeClick}
            />
          </Menu>
          <Segment
            inverted
            style={{
              height: DimensionController.getSidebarPanelHeight(),
            }}
          >
            <Transition
              visible={this.state.meVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getMeContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
