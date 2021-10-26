import React, { Component } from "react";
import {
  Icon,
  Label,
  List,
  Popup
} from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";

export default class LiveCircuitListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;

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
   * The prefix for live-timer element ids so that we can update the tickers
   * for each element
   *
   * @type {string}
   */
  static liveTimerPrefix = "live-timer-";

  /**
   * the interval increment that the wtf timer uses to update the gui with
   * via various UtilRenderer functions which parse nano time into workable
   * seconds, while maintaining nano precision.
   * @type {number}
   */
  static wtfTimerIntervalMs = 1000;

  /**
   * this is called when we unmount the component so that we can clear any active listeners
   * for memory management.
   */
  componentWillUnmount() {
    UtilRenderer.clearIntervalTimer(this.wtfTimer);
  }

  handleClick = () => {
    this.props.onActiveCircuitListItemClick(this);
  };

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
      this.wtfTimer = UtilRenderer.clearIntervalTimer(
        this.wtfTimer
      );

      this.wtfTimer = setInterval(() => {
        let timerEl = document.getElementById(
          LiveCircuitListItem.liveTimerPrefix +
            circuit.circuitName
        );

        timerEl.innerHTML = UtilRenderer.getWtfTimerFromCircuit(
          circuit
        );
      }, LiveCircuitListItem.wtfTimerIntervalMs);

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
            <span
              id={
                LiveCircuitListItem.liveTimerPrefix +
                this.props.model.circuitName
              }
            >
              {this.state.time}
            </span>
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
