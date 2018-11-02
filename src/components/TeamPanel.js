import React, {Component} from "react";
import {Menu, Segment, Transition, Icon, Grid, Popup, Divider} from "semantic-ui-react";
import {DataStoreFactory} from "../DataStoreFactory";
import {RendererEventFactory} from "../RendererEventFactory";
import moment from "moment";
import JournalItem from "./JournalItem";
import TeamMember from "./TeamMember";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the tab panel wrapper for the console content
//
export default class TeamPanel extends Component {
  constructor(props) {
    super(props);

    this.state = this.loadState();
    this.state.me = {id: "", name: ""};
    this.state.teamMembers = [];
    this.state.activeTeamMember = null;

    // this.events = {
    //   consoleOpen: RendererEventFactory.createEvent(
    //     RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
    //     this,
    //     (event, arg) => this.resetCb(event, arg)
    //   )
    // };
  }


  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("Team Layout : componentDidMount");

    this.props.teamStore.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };


  onStoreLoadCb = (err) => {
    this.log("Team Layout : onStoreLoadCb");
    if (err) {
      this.props.teamStore.dto = new this.props.teamStore.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let teamWithMembersDto = this.props.teamStore.dto;

      var membersList = [];
      var teamMembers = teamWithMembersDto.teamMembers;

      for (var i in teamMembers) {
        membersList[i] = this.createMember(i, teamMembers[i]);
      }

      if (teamWithMembersDto.me) {
        let me = this.createMember(0, teamWithMembersDto.me);

        this.setState({
          me: me,
          teamMembers: membersList,
          activeTeamMember: me
        });
      }


      this.log("Success!");
    }
  };

  createMember = (index, teamMember) => {

    let d = teamMember.lastActivity;
    let lastActivity = null;
    if (d != null) {
      let dateObj = new Date(d[0], d[1], d[2], d[3], d[4], d[5]);
      lastActivity = moment(dateObj).format("ddd, MMM Do 'YY, h:mm a");
    }

    let level = 0;
    let xpRequired = 0;
    if (teamMember.xpSummary) {
      level = teamMember.xpSummary.level;
      xpRequired = teamMember.xpSummary.xpRequiredToLevel - teamMember.xpSummary.xpProgress;
    }

    let statusColor = 'offlineColor';
    if (teamMember.activeStatus === 'Online') {
      statusColor = 'onlineColor';
    } else if (teamMember.activeStatus === 'Alarm') {
      statusColor = 'red';
    }

    return {
      id: teamMember.id,
      email: teamMember.email,
      name: teamMember.fullName,
      shortName: teamMember.shortName,

      activeStatus: teamMember.activeStatus,
      activeTaskName: teamMember.activeTaskName,
      activeTaskSummary: teamMember.activeTaskSummary,
      level: level,
      xpRequired: xpRequired,
      mood: teamMember.moodRating,
      workingOn: teamMember.workingOn,
      lastActivity: lastActivity,
      statusColor: statusColor
    };
  };

  componentWillReceiveProps = (nextProps) => {
    let level = 0;
    let xpRequired = 0;
    if (nextProps.xpSummary) {
      level = nextProps.xpSummary.level;
      xpRequired = nextProps.xpSummary.xpRequiredToLevel - nextProps.xpSummary.xpProgress;
    }

    let newMe = this.state.me;

    newMe.level = level;
    newMe.xpRequired = xpRequired;

    this.setState({
      me: newMe
    });

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

    this.props.teamStore.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
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
  handleTeamClick = (e, {name}) => {
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
    this.log("Team member clicked!" + teamMember.name);

    this.setState({
      activeTeamMember: teamMember
    });

  };

  /// renders the console sidebar panel of the console view
  render() {

    const teamMembersContent = (
      <div>
        <Grid inverted>

          <TeamMember
            key={this.state.me.id}
            id={this.state.me.id}
            shortName={"Me ("+this.state.me.shortName + ")"}
            name={this.state.me.name}
            activeStatus={this.state.me.activeStatus}
            statusColor={this.state.me.statusColor}
            activeTaskName={this.state.me.description}
            activeTaskSummary={this.state.me.activeTaskSummary}
            workingOn={this.state.me.workingOn}
            level={this.state.me.level}
            xpRequired={this.state.me.xpRequired}
            onSetActiveRow={this.selectRow}
            teamMember={this.state.me}
            activeTeamMember={this.state.activeTeamMember}
          />

          {this.state.teamMembers.map(d =>

            <TeamMember
              key={d.id}
              id={d.id}
              shortName={d.shortName}
              name={d.name}
              activeStatus={d.activeStatus}
              statusColor={d.statusColor}
              activeTaskName={d.description}
              activeTaskSummary={d.activeTaskSummary}
              workingOn={d.workingOn}
              level={d.level}
              xpRequired={d.xpRequired}
              onSetActiveRow={this.selectRow}
              teamMember={d}
              activeTeamMember={this.state.activeTeamMember}
            />

          )}
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
          <Segment inverted style={{height: this.calculateMenuHeight()}}>
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
