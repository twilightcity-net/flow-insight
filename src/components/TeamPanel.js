import React, { Component } from "react";
import {Button, Image, Menu, Progress, Segment, Transition, Icon, Grid, Popup} from "semantic-ui-react";
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
    this.state.teamMembers = [
      {
        id: "123",
        name: "Janelle",
        mood: -5,
        status: "(WTF)"
      },
      {
        id: "456",
        name: "Adrian",
        mood: 2
      },
      {
        id: "789",
        name: "Casey",
        mood: 3
      },
    ];
  }

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

      let me = this.createMember(0, teamWithMembersDto.me);

      this.setState({
        me: me,
        teamMembers: membersList
      });

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

    return {
      id: teamMember.id,
      email: teamMember.email,
      name: teamMember.fullName,

      activeStatus: teamMember.activeStatus,
      activeTaskName: teamMember.activeTaskName,
      activeTaskSummary: teamMember.activeTaskSummary,
      workingOn: teamMember.workingOn,
      lastActivity: lastActivity
    };
  };

  componentWillReceiveProps = (nextProps) => {


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
  };

  /// renders the console sidebar panel of the console view
  render() {
    const { activeItem } = this.state;

    const teamMembersContent = (
        <div >
          <Grid inverted>
            <Grid.Row id={this.state.me.id} onClick={() => this.selectRow(this.state.me.id, this.state.me)}>
              <Grid.Column width={1}>
                <Icon link color='purple' name='circle' />
              </Grid.Column>
              <Grid.Column width={12}>
                Me ({this.state.me.name})
              </Grid.Column>
            </Grid.Row>

            {this.state.teamMembers.map(d =>

              <Grid.Row id={d.id} onClick={() => this.selectRow(d.id, d)}>
                <Grid.Column width={1}>
                  <Icon link color='purple' name='circle' />
                </Grid.Column>
                <Grid.Column width={12}>
                  {d.name}
                </Grid.Column>
              </Grid.Row>
            )}
          </Grid>
        </div>
    );

    return (
      <div
        id="component"
        className="consoleSidebarPanel"
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
