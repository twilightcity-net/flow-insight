import React, {Component} from "react";
import {MemberClient} from "../../../../clients/MemberClient";
import GameSketch from "./components/GameSketch";

/**
 * this component is the tab panel wrapper for the play game content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class PlayResource extends Component {
  /**
   * builds the play layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[PlayResource]";
    this.state = {
      me : MemberClient.me,
      visible: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        visible: true
      })
    }, 333);
  }

  /**
   * renders the game sketch
   * @returns {*} - the rendered components JSX
   */
  render() {
    let content = "";
    if (this.state.visible) {
      content = <GameSketch me={this.state.me}/>;
      document.getElementById("playGameWrapper").style.opacity = 1;
    }

    return (
    <div id="playGameWrapper">
      {content}
    </div>);
  }
}
