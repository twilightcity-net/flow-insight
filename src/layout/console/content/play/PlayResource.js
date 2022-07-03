import React, {Component} from "react";
import AdventureGame from "./AdventureGame";
import GameLoadingScreen from "./components/GameLoadingScreen";

/**
 * this component is the tab panel wrapper for the play game content
 * @copyright Twilight City, Inc. 2022©®™√
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
      isIntroVideo: true
    }
  }

  componentDidMount() {
   this.handleFadeOfIntroAndGame();
  }

  componentWillUnmount() {
    if (this.introTimeout) {
      clearTimeout(this.introTimeout);
    }
    if (this.introTimeout2) {
      clearTimeout(this.introTimeout2);
    }
    if (this.introTimeout3) {
      clearTimeout(this.introTimeout3);
    }
  }

  /**
   * The transitions on the wrapper elements handle fading opacity in and out,
   * to do the transitions, we need to set a timeout on the intro to fade out,
   * then flip to the game, and fade in
   */
  handleFadeOfIntroAndGame() {
    this.introTimeout = setTimeout(() => {
      this.introTimeout2 = setTimeout(() => {
        document.getElementById("introVideoWrapper").style.opacity = 0;
        this.introTimeout3 = setTimeout(() => {
          this.setState({
            isIntroVideo: false
          });
          setTimeout( () => {
            document.getElementById("playGameWrapper").style.opacity = 1;
          }, 333);
        }, 333);
      }, 0.6);

    }, 9000);
  }

  /**
   * renders the game sketch
   * @returns {*} - the rendered components JSX
   */
  render() {
    if (this.state.isIntroVideo) {
      return (
        <div>
          <div style={{display: "block"}}>
            <GameLoadingScreen/>
          </div>
          <div style={{display: "none"}}>
            <AdventureGame/>
          </div>
        </div>);
    } else {
      return (
        <div>
          <div style={{display: "none"}}>
            <GameLoadingScreen/>
          </div>
          <div style={{display: "block"}}>
            <AdventureGame/>
          </div>
        </div>);
    }
  }
}
