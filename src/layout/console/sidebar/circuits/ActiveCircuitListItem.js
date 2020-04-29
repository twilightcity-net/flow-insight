import React, { Component } from "react";
import { Icon, Label, List } from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";

export default class ActiveCircuitListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,
      isRetro: LearningCircuitModel.isRetro(
        this.props.model
      ),
      time: UtilRenderer.getTimeStringFromTimeArray(
        this.props.model.openTime
      ),
      timerIcon: this.isRetro
        ? "balance scale"
        : "lightning",
      timerColor: this.isRetro ? "violet" : "red"
    };
  }

  handleClick = () => {
    this.props.onActiveCircuitListItemClick(this);
    this.setState({
      isSelected: true
    });
  };

  getClassName() {
    return (
      this.timerColor +
      (this.state.isSelected ? " selected" : "")
    );
  }

  render() {
    return (
      <List.Item
        className={this.getClassName()}
        key={this.props.model.id}
        onClick={this.handleClick}
      >
        <List.Content
          floated="right"
          verticalAlign="middle"
          className="circuitLabelTimer"
        >
          <Label color={this.state.timerColor}>
            <Icon name={this.state.timerIcon} />{" "}
            {this.state.time}
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>
            {this.props.model.circuitName}
          </List.Header>
          <i className="name">(Zoe Love)</i>
          {/*<i className="name">({this.props.model.ownerName})</i>*/}
        </List.Content>
      </List.Item>
    );
  }
}
