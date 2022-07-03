import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";

/**
 * this component is the tab panel wrapper for the game loading screen panel
 * @copyright Twilight City, Inc. 2022©®™√
 */
export default class GameLoadingScreen extends Component {
  /**
   * builds the game loading screen content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[GameLoadingScreen]";

    this.height = DimensionController.getHeightFor(DimensionController.Components.PLAY_PANEL);
    this.width = DimensionController.getFullRightPanelWidth();

  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  getVideoSrcLink() {
    return "./assets/video/FervieAdventuresIntro.mp4"
  }

  onVideoEnded = () => {
    console.log("video ended!");
  }

  /**
   * renders the loading screen
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.PLAY_PANEL
    );

    let videoSrc =  this.getVideoSrcLink(),
      videoType = "video/mp4";

    return (
      <div
        id="component"
        className="playLayout"
        style={{ height: height }}
      >
        <div className={"introVideo"} id="introVideoWrapper">
          <video
            onEnded={this.onVideoEnded}
            muted
            autoPlay
            height="300px"
          >
            <source src={videoSrc} type={videoType} />
          </video>
        </div>
      </div>
    );
  }
}
