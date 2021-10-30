import React, { Component } from "react";
import {
  Button,
  Icon,
  List,
  Popup
} from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";

/**
 * builds our retros circuit list component.
 */
export default class RetroCircuitListItem extends Component {
  constructor(props) {
    super(props);
    this.isClosed = false;
    this.state = {
      isSelected: false,
      isRetro: LearningCircuitModel.isRetro(
        this.props.model
      ),
      time: UtilRenderer.getWtfTimerFromCircuit(this.props.model),
      seconds:  UtilRenderer.getWtfSecondsFromCircuit(this.props.model),
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
    if (!this.isClosed) {
      this.props.onRetroCircuitListItemClick(this);
    }
  };

  handleCloseClick = () => {
    this.isClosed = true;
    this.props.onRetroCloseItemClick(this);
  };

  /**
   * gets our classname based on whether the isSelected state property is
   * set to true or not.
   */
  getClassName() {
    return this.timerColor;
  }


  getPercentTime() {
    let percent = (Math.ceil((this.state.seconds / this.props.maxTime)*100)) + "%";
    return percent;
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
            <b>
              <Icon name={this.state.timerIcon} />{" "}
              {this.state.time}
            </b>
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

          <div  className="heatbar">
            <div className="bar" style={{width: this.getPercentTime()}}/>
          </div>

          <Button
            icon="close"
            className="closeButton"
            onClick={this.handleCloseClick}
          />

        </List.Content>
        <List.Content className="circuit">

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
