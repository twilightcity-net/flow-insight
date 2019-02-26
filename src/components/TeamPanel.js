import React, { Component } from "react";
import { Menu, Segment, Transition, Grid } from "semantic-ui-react";
import moment from "moment";
import TeamMember from "./TeamMember";
import {DataStoreFactory} from "../DataStoreFactory";
import { DataModelFactory } from "../models/DataModelFactory";

const { remote } = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the tab panel wrapper for the console content
//
export default class TeamPanel extends Component {
  constructor(props) {
    super(props);

    this.state = this.loadState();

  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("Team Layout : componentDidMount");


  };


  componentWillReceiveProps = nextProps => {
    let newMe = nextProps.me;

    if (nextProps.xpSummary) {
      newMe.level = nextProps.xpSummary.level;
      newMe.xpRequired =
        nextProps.xpSummary.xpRequiredToLevel - nextProps.xpSummary.xpProgress;
    }

    if (this.lastOpenCloseState === 1 && nextProps.consoleIsCollapsed === 0) {
      //if it's now open, and used to be closed, need to reset the window
      this.resetCb();
    }

    this.lastOpenCloseState = nextProps.consoleIsCollapsed;
  };

  resetCb = () => {
    this.log("RESET TEAM PANEL!!!");
    if (this.state.me) {
      setTimeout(() => {
        this.selectRow(this.state.me.id, this.state.me);
      }, this.activateWaitDelay);
    }
  };

  /// laods the stored state from parent or use default values
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        animationType: "fly down",
        animationDelay: 350,
        title: ""
      };
    }
    return state;
  }

  /// stores this components state in the parents state
  saveState(state) {
    this.props.saveStateCb(state);
  }

  /// performs a simple calculation for dynamic height of panel
  calculateMenuHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 8,
      contentHeader: 34,
      bottomMenuHeight: 28
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader -
      heights.bottomMenuHeight
    );
  }

  /// updates display to show spirit content
  handleTeamClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      teamVisible: false,
      addressBookVisible: false
    });
    setTimeout(() => {
      this.setState({
        teamVisible: true
      });
    }, this.state.animationDelay);
  };

  selectRow = (id, teamMember) => {
    this.log("Team member clicked!" + teamMember.name + "id = "+id);

    this.props.setActiveMember(id);
  };

  /// renders the console sidebar panel of the console view
  render() {

    const teamMembersContent = (
      <div>
        <Grid inverted>
          <TeamMember
            key={this.props.me.id}
            id={this.props.me.id}
            shortName={"Me (" + this.props.me.shortName + ")"}
            name={this.props.me.name}
            activeStatus={this.props.me.onlineStatus}
            statusColor={this.props.me.statusColor}
            activeTaskName={this.props.me.description}
            activeTaskSummary={this.props.me.activeTaskSummary}
            workingOn={this.props.me.workingOn}
            alarmDurationInSeconds={this.props.me.alarmDurationInSeconds}
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
              shortName={d.shortName}
              name={d.name}
              activeStatus={d.onlineStatus}
              statusColor={d.statusColor}
              activeTaskName={d.description}
              activeTaskSummary={d.activeTaskSummary}
              workingOn={d.workingOn}
              alarmDurationInSeconds={d.alarmDurationInSeconds}
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
            <Menu.Item
              name="team"
              active={true}
              onClick={this.handleTeamClick}
            />
          </Menu>
          <Segment inverted style={{ height: this.calculateMenuHeight() }}>
            <Transition
              visible={this.state.teamVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {teamMembersContent}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
