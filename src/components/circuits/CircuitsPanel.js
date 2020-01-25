import React, { Component } from "react";
import { Menu, Segment, Transition, Grid } from "semantic-ui-react";
import TeamMember from "../team/TeamMember";
import { DataModelFactory } from "../../models/DataModelFactory";
import { DimensionController } from "../../controllers/DimensionController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class CircuitsPanel extends Component {
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
  }

  /**
   * called before updating
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    let newMe = nextProps.me;

    if (nextProps.xpSummary) {
      newMe.level = nextProps.xpSummary.level;
      newMe.xpRequired =
        nextProps.xpSummary.xpRequiredToLevel - nextProps.xpSummary.xpProgress;
    }
  };

  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
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

  /**
   * stores this components state in the parents state
   * @param state
   */
  saveState(state) {
    this.props.saveStateCb(state);
  }

  /**
   * updates display to show spirit content
   * @param e
   * @param name
   */
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

  /**
   * selects a team member in the list
   * @param id
   * @param teamMember
   */
  selectRow = (id, teamMember) => {
    console.log(
      this.name + " - Team member clicked!" + teamMember.name + "id = " + id
    );

    this.teamModel.setActiveMember(id);
  };

  /**
   * determines if we are currently linked to another team member
   * @param memberId
   * @returns {boolean}
   */
  isLinked = memberId => {
    return this.spiritModel.isLinked(memberId);
  };

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    const teamMembersContent = (
      <div>
        <Grid inverted>
          <TeamMember
            key={this.props.me.id}
            id={this.props.me.id}
            isLinked={this.isLinked(this.props.me.id)}
            shortName={this.props.me.shortName + " (you)"}
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
              shortName={d.shortName}
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
              {teamMembersContent}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
