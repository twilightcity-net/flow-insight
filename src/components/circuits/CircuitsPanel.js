import React, { Component } from "react";
import { Menu, Segment, Transition } from "semantic-ui-react";
import { DimensionController } from "../../controllers/DimensionController";
// import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";

//
// this component is the tab panel wrapper for the console content
//
export default class CircuitsPanel extends Component {
  constructor(props) {
    super(props);

    this.name = "[CircuitsPanel]";
    this.state = this.loadState();
  }

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
  // saveState(state) {
  //   this.props.saveStateCb(state);
  // }

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
  //
  //
  // selectRow = (id, teamMember) => {
  //   this.teamModel.setActiveMember(id);
  // };
  //
  //
  // isLinked = memberId => {
  //   return this.spiritModel.isLinked(memberId);
  // };

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
              Circuits Navigator
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
