import React, {Component} from "react";
import {Icon, Label, List, Popup,} from "semantic-ui-react";
import UtilRenderer from "../../../../../../UtilRenderer";

export default class MoovieListItem extends Component {
  constructor(props) {
    super(props);

    this.timer = null;
  }

  static moovieTimerPrefix = "moovie-timer-";

  /**
   * the interval increment that the timer uses to update the gui with
   * via various UtilRenderer functions which parse nano time into workable
   * seconds, while maintaining nano precision.
   * @type {number}
   */
  static moovieTimerIntervalMs = 1000;

  /**
   * this is called when we unmount the component so that we can clear any active listeners
   * for memory management.
   */
  componentWillUnmount() {
    UtilRenderer.clearIntervalTimer(this.timer);
  }

  handleClick = () => {

  };

  /**
   * renders our movie timer
   * renderer.
   * @param circuit
   * @returns {string}
   */

  getTimerCount(key, startTime) {
    if (!key) {
      return "loading...";
    } else {
      this.timer = UtilRenderer.clearIntervalTimer(this.timer);

      this.timer = setInterval(() => {
        let timerEl = document.getElementById(
          MoovieListItem.moovieTimerPrefix + key);

        timerEl.innerHTML = "00:00";
        //TODO lets make timers for our moovies!
        //timerEl.innerHTML = UtilRenderer.getWtfTimerFromCircuit(circuit);
      }, MoovieListItem.moovieTimerIntervalMs);

      return "00:00";
    }
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let popupContent = (
      <div>
        <div className="circuit">
          <div className="state">
            <b>{this.props.title}</b>
            <div style={{float: "right"}}>{this.props.year}</div>
          </div>
          <div className="name">
            <i>Click to open the door to this moovie</i>
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
    ( <List.Item
        key={this.props.id}
        onClick={this.props.onClickItem}
      >
        <List.Content
          floated="right"
          verticalAlign="middle"
          className="circuitLabelTimer"
        >
          <Label color="violet">
            <span id={"user"+this.props.id}>
              {this.props.people}
            </span>{" "}
            <Icon name="user" />{" "}
            <span id={"moovie"+this.props.id} className="timer">
              {this.props.timer}
            </span>
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>
            {this.props.title}
          </List.Header>
          <i className="name">
            ({this.props.serviceProviderType})
          </i>
        </List.Content>
      </List.Item>));
  }
}
