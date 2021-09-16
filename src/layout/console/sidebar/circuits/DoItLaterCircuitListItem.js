import React, { Component } from "react";
import { Icon, Label, List } from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";
import moment from "moment";

/**
 * builds our do it later circuit list component
 */
export default class DoItLaterCircuitListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,
      isRetro: LearningCircuitModel.isRetro(
        this.props.model
      ),
      time: this.getWtfTimerCount(this.props.model),
      timerIcon: this.isRetro
        ? "balance scale"
        : "lightning",
      timerColor: this.isRetro ? "violet" : "red"
    };
  }

  /**
   * click handler for our do it later component
   */
  handleClick = () => {
    this.props.onDoItLaterCircuitListItemClick(this);
  };

  /**
   * gets our classname
   */
  getClassName() {
    return (
      this.timerColor
    );
  }

    /**
     * renders our wtf time from the circuit that is passed into from the
     * renderer.
     * @param circuit
     * @returns {string}
     */
    getWtfTimerCount(circuit) {
        if (!circuit) {
            return "loading...";
        } else {
            this.openUtcTime = moment.utc(circuit.openTime);

            return UtilRenderer.getWtfTimerStringFromOpenMinusPausedTime(
                this.openUtcTime,
                circuit.totalCircuitPausedNanoTime
            );
        }
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
          <i className="name">({this.props.model.ownerName})</i>
        </List.Content>
      </List.Item>
    );
  }
}
