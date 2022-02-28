import React, { Component } from "react";
import { DimensionController } from "../../../../controllers/DimensionController";
import p5 from "p5";
import FervieWalkUp from "./components/FervieWalkUp";
import AnimationLoader from "./components/AnimationLoader";
import FervieWalkRight from "./components/FervieWalkRight";
import FervieWalkDown from "./components/FervieWalkDown";
import FervieSprite from "./components/FervieSprite";
import HouseBackground from "./components/HouseBackground";
import { MemberClient } from "../../../../clients/MemberClient";
import FervieColors from "../support/FervieColors";

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
    this.animationLoader = new AnimationLoader();
    this.state = {
      resource: props.resource,
    };
  }

  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    this.height = DimensionController.getHeightFor(
      DimensionController.Components.PLAY_PANEL
    );
    this.width =
      DimensionController.getFullRightPanelWidth();

    const sketch = (p5) => {
      p5.setup = () => {
        p5.createCanvas(this.width, this.height);
        p5.frameRate(24);

        this.fervieSprite = new FervieSprite(
          this.animationLoader,
          this.width / 2,
          this.height / 2,
          220,
          FervieSprite.Direction.Down
        );
        this.fervieSprite.preload(p5);

        this.houseBackground = new HouseBackground(
          this.animationLoader,
          this.width,
          this.height
        );
      };

      p5.draw = () => {
        this.houseBackground.draw(p5);
        this.fervieSprite.draw(p5);

        this.houseBackground.update(p5);
        this.fervieSprite.update(p5);
      };
    };

    this.sketchInstance = new p5(sketch, "mySketch");
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.PLAY_PANEL
    );
    let fervieColor = FervieColors.defaultFervieColor;
    let fervieShoeColor = FervieColors.defaultShoeColor;

    if (MemberClient.me) {
      fervieColor = MemberClient.me.fervieColor;
      fervieShoeColor =
        MemberClient.me.fervieSecondaryColor;
    }

    return (
      <div
        id="component"
        className="playLayout"
        style={{ height: height }}
      >
        <div id="mySketch" />
        <div id="fervies">
          {FervieWalkUp.getFrame(
            1,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            2,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            3,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            4,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            5,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            6,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            7,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            8,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            9,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            10,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            11,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkUp.getFrame(
            12,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            1,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            2,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            3,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            4,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            5,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            6,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            7,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            8,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            9,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            10,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            11,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkRight.getFrame(
            12,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            1,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            2,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            3,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            4,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            5,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            6,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            7,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            8,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            9,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            10,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            11,
            fervieColor,
            fervieShoeColor
          )}
          {FervieWalkDown.getFrame(
            12,
            fervieColor,
            fervieShoeColor
          )}
        </div>
      </div>
    );
  }
}
