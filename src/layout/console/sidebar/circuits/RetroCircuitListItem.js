import React, { Component } from "react";
import {
  Button,
  Icon, Label,
  List,
  Popup
} from "semantic-ui-react";
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
    let seconds = UtilRenderer.getWtfSecondsFromCircuit(this.props.model);
    let percent = (Math.ceil((seconds / this.props.maxTime)*100)) + "%";
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

  getTimerIcon() {
    let isRetro = UtilRenderer.isCircuitInRetro(this.props.model);

    return isRetro ? "balance scale" : "lightning";
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let circuit = this.props.model,
      description = circuit.description;


    let time = UtilRenderer.getWtfTimerFromCircuit(this.props.model);

    let label = "";
    if (UtilRenderer.isCircuitInRetro(this.props.model)) {
      label = this.props.model.circuitState;
    } else {
      label = <span>
        <Icon name={this.getTimerIcon()} />{" "}
        {time}
        </span>
    }

    let popupContent = (
      <div>
        <div className="circuit">
          <div className="state">
            <b>
              {label}
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

  getBar() {
    if (this.props.model.circuitState === "RETRO") {
      return (
        <Label color="violet">
          <Icon name="balance scale" />{" "}
          {this.getWtfTimerCount(this.props.model)}
        </Label>
      );
    } else {
      // return (
      //   <Label color="red">
      //     <Icon name="lightning"/>{" "}
      //     {this.getWtfTimerCount(this.props.model)}
      //   </Label>
      // );


      return (
        <div  className="heatbar">
          <div className="bar" style={{width: this.getPercentTime()}}/>
        </div>
      );
    }
  }

  getCloseButton() {
    if (this.props.model.circuitState === "RETRO") {
      return (
        ""
      );
    } else {
      return (
        <Button
          icon="close"
          className="closeButton"
          onClick={this.handleCloseClick}
        />
      );
    }
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

          {this.getBar()}

          {this.getCloseButton()}


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
