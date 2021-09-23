import React, { Component } from "react";
import {
  Icon,
  Label,
  List,
  Popup
} from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";
import moment from "moment";

/**
 * builds our retros circuit list component.
 */
export default class RetroCircuitListItem extends Component {
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
   * click handler for our retro component.
   */
  handleClick = () => {
    this.props.onRetroCircuitListItemClick(this);
  };

  /**
   * gets our classname based on whether the isSelected state property is
   * set to true or not.
   */
  getClassName() {
    return this.timerColor;
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
      return UtilRenderer.getWtfTimerFromCircuit(circuit);
    }
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let circuit = this.props.model,
      circuitState = circuit.circuitState,
      description = circuit.description;

    let popupContent = (
      <div>
        <div className="circuit">
          <div className="state">
            <b>{circuitState}</b>
          </div>
          <div className="name">
            <i>{description}</i>
          </div>
        </div>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="circuitPopup chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  /**
   * renders our shit.
   */
  render() {
    return this.getPopupContent(
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
          <i className="name">
            ({this.props.model.ownerName})
          </i>
        </List.Content>
      </List.Item>
    );
  }
}
