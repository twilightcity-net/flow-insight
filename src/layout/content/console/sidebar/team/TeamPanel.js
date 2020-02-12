import React, { Component } from "react";
import { Menu, Segment, Transition, Grid } from "semantic-ui-react";
import TeamMember from "./TeamMember";
import { DataModelFactory } from "../../../../../models/DataModelFactory";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../../../controllers/SidePanelViewController";
import { BrowserRequestFactory } from "../../../../../controllers/BrowserRequestFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TeamPanel extends Component {
  /**
   * builds the team panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TeamPanel]";
    this.state = this.loadState();
    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
  }

  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.TEAM,
        teamVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
        title: ""
      };
    }
    return state;
  }

  /**
   * stores this components state in the parents state
   * @param state
   */
  saveState(state) {
    this.props.saveStateCb(state);
  }

  /**
   * called when we render the team panel into the gui
   */
  componentDidMount = () => {
    this.myController.configureTeamPanelListener(this, this.onRefreshTeamPanel);
    this.onRefreshTeamPanel();
  };

  /**
   * called to refresh the team panel with new data
   */
  onRefreshTeamPanel() {
    switch (this.myController.activeTeamSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.TEAM:
        this.showTeamPanel();
        break;
      default:
        throw new Error("Unknown team panel menu item");
    }
  }

  /**
   * called to display the team panel in the gui
   */
  showTeamPanel() {
    this.teamModel.refreshAll();
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.TEAM,
      teamVisible: true
    });
  }

  /**
   * called when removing the component from the gui. removes any associated listeners for
   * memory management
   */
  componentWillUnmount = () => {
    this.myController.configureTeamPanelListener(this, null);
  };

  /**
   * updates display to show spirit content
   * @param e
   * @param name
   */
  handleClick = (e, { name }) => {
    this.myController.changeActiveTeamSubmenuPanel(name);
  };

  /**
   * selects a team member in the list
   * @param id
   * @param teamMember
   */
  selectRow = (id, teamMember) => {
    console.log(
      this.name + " - Team member clicked!" + teamMember.name + "id = " + id
    );
    this.requestBrowserToLoadTeamJournalAndSetActiveMember(teamMember.name);
    // this.teamModel.setActiveMember(id);
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param circuitName
   */
  requestBrowserToLoadTeamJournalAndSetActiveMember(teamMember) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.TEAM,
      teamMember
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * determines if we are currently linked to another team member
   * @param memberId
   * @returns {boolean}
   */
  isLinked = memberId => {
    return this.spiritModel.isLinked(memberId);
  };

  /**
   * gets our team panel content with the team model that was passed in from the props
   * @returns {*}
   */
  getTeamMembersContent = () => {
    return (
      <div>
        <Grid inverted>
          <TeamMember
            key={this.props.me.id}
            id={this.props.me.id}
            isLinked={this.isLinked(this.props.me.id)}
            displayName={this.props.me.displayName + " (you)"}
            name={this.props.me.name}
            activeStatus={this.props.me.activeStatus}
            statusColor={this.props.me.statusColor}
            activeTaskName={this.props.me.activeTaskName}
            activeTaskSummary={this.props.me.activeTaskSummary}
            workingOn={this.props.me.workingOn}
            isAlarmTriggered={this.props.me.isAlarmTriggered}
            wtfTimer={this.props.me.wtfTimer}
            alarmStatusMessage={this.props.me.alarmStatusMessage}
            level={this.props.me.level}
            xpRequired={this.props.me.xpRequired}
            onSetActiveRow={this.selectRow}
            teamMember={this.props.me}
            activeTeamMember={this.props.activeTeamMember}
          />
          {this.props.teamMembers.map(d => (
            <TeamMember
              key={d.id}
              id={d.id}
              isLinked={this.isLinked(d.id)}
              displayName={d.displayName}
              name={d.name}
              activeStatus={d.activeStatus}
              statusColor={d.statusColor}
              activeTaskName={d.activeTaskName}
              activeTaskSummary={d.activeTaskSummary}
              workingOn={d.workingOn}
              isAlarmTriggered={d.isAlarmTriggered}
              wtfTimer={d.wtfTimer}
              alarmStatusMessage={this.props.me.alarmStatusMessage}
              level={d.level}
              xpRequired={d.xpRequired}
              onSetActiveRow={this.selectRow}
              teamMember={d}
              activeTeamMember={this.props.activeTeamMember}
            />
          ))}
        </Grid>
      </div>
    );
  };

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel teamPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item name="team" active={true} onClick={this.handleClick} />
          </Menu>
          <Segment
            inverted
            style={{ height: DimensionController.getSidebarPanelHeight() }}
          >
            <Transition
              visible={this.state.teamVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getTeamMembersContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
