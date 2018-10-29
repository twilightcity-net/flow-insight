import React, { Component } from "react";
import {Button, Image, Menu, Progress, Segment, Transition, Icon, Grid, Popup, Divider} from "semantic-ui-react";
import {DataStoreFactory} from "../DataStoreFactory";
import {RendererEventFactory} from "../RendererEventFactory";
import JournalItem from "./JournalItem";
import moment from "moment";

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

    this.events = {
      consoleOpen: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        (event, arg) => this.resetCb(event, arg)
      )
    };
  }

  resetCb = (event, showHide) => {
    this.log("Reset CB!"+ showHide);
    if (this.state.me) {
      setTimeout(() => {
        this.selectRow(this.state.me.id, this.state.me);
      }, this.activateWaitDelay);
    }

    if (showHide === 0) {
      this.store.load(
        null,
        err => {
          setTimeout(() => {
            this.onStoreLoadCb(err);
          }, this.activateWaitDelay);
        });
    }
  };

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };



  componentDidMount = () => {
    this.log("Team Layout : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.TEAM_WITH_MEMBERS,
      this
    );

    this.store.load(
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
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let teamWithMembersDto = this.store.dto;

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
      lastActivity =  moment(dateObj).format("ddd, MMM Do 'YY, h:mm a");
    }

    let level = 0;
    let xpRequired = 0;
    if (teamMember.xpSummary) {
      level = teamMember.xpSummary.level;
      xpRequired = teamMember.xpSummary.xpRequiredToLevel - teamMember.xpSummary.xpProgress;
    }

    let statusColor = 'grey';
    if (teamMember.activeStatus === 'Online') {
      statusColor = 'purple';
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
    this.log("XXXXXXXXXZZZZZZZZZZZ " + nextProps.xpSummary);

    let level = 0;
    let xpRequired = 0;
    if (nextProps.xpSummary) {
      level = nextProps.xpSummary.level;
      xpRequired = nextProps.xpSummary.xpRequiredToLevel - nextProps.xpSummary.xpProgress;
    }

    this.state.me.level = level;
    this.state.me.xpRequired = xpRequired;

    this.setState({
      me: this.state.me
    });

  };

  /// laods the stored state from parent or use default values
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: "team",
        teamVisible: true,
        circlesVisible: false,
        animationType: "fly down",
        animationDelay: 350,
        level: 0,
        percentXP: 99,
        totalXP: 99999,
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
    this.log("Team member clicked!" + teamMember.name);

    let rowObj = document.getElementById(id);

    this.clearActiveRows();

    if (rowObj) {
      rowObj.classList.add("active");

      this.setState({
        activeTeamMember: teamMember
      });
    }

  };

  clearActiveRows = () => {
    if (this.state.activeTeamMember) {
      let rowObj = document.getElementById(this.state.activeTeamMember.id);
      rowObj.classList.remove("active");
    }
  };



  /// renders the console sidebar panel of the console view
  render() {
    const { activeItem } = this.state;

    let meIsActive = "";
    if (this.state.activeTeamMember === this.state.me) {
      meIsActive = "active";
    }

    const teamMembersContent = (
        <div >
          <Grid inverted>
            <Grid.Row className={meIsActive} id={this.state.me.id} onClick={() => this.selectRow(this.state.me.id, this.state.me)}>
              <Grid.Column width={1}>
                <Icon link color={this.state.me.statusColor} name='circle' />
              </Grid.Column>
              <Grid.Column width={12}>

                  <Popup
                    trigger={
                      <div className="memberText">
                        Me ({this.state.me.shortName})
                      </div>
                    }
                    className="chunkTitle"
                    content={
                      <div>
                        <div>
                          <i>{this.state.me.name} ({this.state.me.activeStatus})</i>
                        </div>
                        <div>
                          <b>{this.state.me.activeTaskName} </b>
                        </div>
                        <div>
                          {this.state.me.activeTaskSummary}
                        </div>
                        <div>
                          {this.state.me.workingOn}

                        </div>
                        <Divider />
                        <div>
                        <span className="date">
                          Torchie Level {this.state.me.level}&nbsp;&nbsp; (+{this.state.me.xpRequired} to go)
                        </span>

                        </div>
                      </div>
                    }
                    position="bottom left"
                    inverted
                    hideOnScroll
                  />



              </Grid.Column>
            </Grid.Row>

            {this.state.teamMembers.map(d =>

              <Grid.Row id={d.id} onClick={() => this.selectRow(d.id, d)}>
                <Grid.Column width={1}>

                    <Icon color={d.statusColor} name='circle' />
                </Grid.Column>
                <Grid.Column width={12}>
                  <Popup
                    trigger={
                      <div className="memberText">
                        {d.shortName}
                      </div>
                    }
                    className="chunkTitle"
                    content={
                      <div>
                        <div>
                          <i>{d.name} ({d.activeStatus})</i>
                        </div>
                        <div>
                          <b>{d.activeTaskName} </b>
                        </div>
                        <div>
                          {d.activeTaskSummary}
                        </div>
                        <div>
                          {d.workingOn}

                        </div>
                        <Divider />
                        <div>
                        <span className="date">
                          Torchie Level {d.level}&nbsp;&nbsp; (+{d.xpRequired} to go)
                        </span>

                        </div>
                      </div>
                    }
                    position="bottom left"
                    inverted
                    hideOnScroll
                  />


                </Grid.Column>
              </Grid.Row>
            )}
          </Grid>
        </div>
    );

    return (
      <div
        id="component"
        className="teamPanel"
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
