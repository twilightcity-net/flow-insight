import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import p5 from "p5";
import FervieWalkUp from "./fervie/FervieWalkUp";
import AnimationLoader from "./AnimationLoader";
import FervieWalkRight from "./fervie/FervieWalkRight";
import FervieWalkDown from "./fervie/FervieWalkDown";
import FervieSprite from "./fervie/FervieSprite";
import FervieColors from "../../support/FervieColors";
import ShroomHouse from "./places/ShroomHouse";
import EnvironmentMap from "./environment/EnvironmentMap";
import LadyFervie from "./fervie/LadyFervie";

/**
 * this component is the tab panel wrapper for the game content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class GameSketch extends Component {
  /**
   * builds the game layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[GameSketch]";
    this.animationLoader = new AnimationLoader();
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

        this.environment = new EnvironmentMap(this.animationLoader, this.width, this.height);
        this.environment.preload(p5);

        this.fervieSprite = new FervieSprite(
          this.animationLoader,
          this.width / 2,
          this.height /2,
          180,
          FervieSprite.Direction.Right
        );
        this.fervieSprite.preload(p5);

        let spawnPoint = this.environment.getDefaultSpawnProperties();
        this.fervieSprite.moveToPoint(spawnPoint.x, spawnPoint.y);

      };

      p5.draw = () => {
        this.environment.drawBackground(p5, this.fervieSprite);
        this.fervieSprite.draw(p5);

        this.environment.drawOverlay(p5, this.fervieSprite);

        this.environment.update(p5, this.fervieSprite);
        this.fervieSprite.update(p5, this.environment);
      };
    };

    this.sketchInstance = new p5(sketch, "mySketch");
  }

  componentWillUnmount() {
    this.sketchInstance.remove();
  }

  /**
   * renders the game
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.PLAY_PANEL
    );
    let fervieColor = FervieColors.defaultFervieColor;
    let fervieShoeColor = FervieColors.defaultShoeColor;

    if (this.props.me) {
      fervieColor = this.props.me.fervieColor;
      fervieShoeColor =
        this.props.me.fervieSecondaryColor;
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
          {ShroomHouse.getDefault()}
          {LadyFervie.getFrame(1)}
          {LadyFervie.getFrame(2)}
        </div>
      </div>
    );
  }
}
