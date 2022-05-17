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
import LadyFervie from "./characters/LadyFervie";
import FerviePose from "./fervie/FerviePose";
import MoovieFervie from "./fervie/MoovieFervie";
import CityStreetSigns from "./places/CityStreetSigns";
import GlobalHud from "./hud/GlobalHud";
import {Button, Icon} from "semantic-ui-react";

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
    this.isInitialized = false;
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

        this.globalHud = new GlobalHud(this.animationLoader, this.width, this.height);
        this.globalHud.preload(p5);

        this.environment = new EnvironmentMap(
          this.animationLoader,
          this.width,
          this.height,
          this.globalHud
        );
        this.environment.preload(p5);


        this.fervieSprite = new FervieSprite(
          this.animationLoader,
          this.width / 2,
          this.height / 2,
          180,
          FervieSprite.Direction.Right,
          this.environment.getScaleX(),
          this.environment.getScaleY()
        );

        this.fervieSprite.preload(p5);

        let spawnPoint =
          this.environment.getDefaultSpawnProperties();
        this.fervieSprite.moveToPoint(
          spawnPoint.x,
          spawnPoint.y,
          spawnPoint.scale
        );
      };

      p5.draw = () => {
        this.environment.drawBackground(p5, this.fervieSprite);
        this.fervieSprite.draw(p5);
        this.environment.drawOverlay(p5, this.fervieSprite);

        this.globalHud.draw(p5);

        this.environment.update(p5, this.fervieSprite);
        this.fervieSprite.update(p5, this.environment);

        if (!this.isInitialized) {
          this.props.onFinishedLoading();
          this.isInitialized = true;
          console.log("Finished!");
        }
      };

      p5.mousePressed = () => {
        this.environment.mousePressed(p5, this.fervieSprite);
        this.globalHud.mousePressed(p5, this.fervieSprite);
      };

      p5.keyPressed = () => {
        this.globalHud.keyPressed(p5)
      }
    };

    this.sketchInstance = new p5(sketch, "mySketch");
  }

  componentWillUnmount() {
    this.sketchInstance.remove();
  }

  getMoovieDialog() {
    return (<div id="playDialog">
      <div>
        <Button color="violet">
          Create a Moovie Room
        </Button>
      </div>
      <div>
        <Button color="violet">
          Join a Moovie Room
        </Button>
      </div>
    </div>);
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
      fervieShoeColor = this.props.me.fervieSecondaryColor;
    }

    let moovieDialog = this.getMoovieDialog();
    return (
      <div
        id="component"
        className="playLayout"
        style={{ height: height }}
      >
        <div id="mySketch" />
        {moovieDialog}
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
          {FerviePose.getPose(FerviePose.Pose.Glow,
            fervieColor,
            fervieShoeColor
          )}
          {FerviePose.getPose(FerviePose.Pose.Kiss,
            fervieColor,
            fervieShoeColor
          )}
          {CityStreetSigns.getDefault()}
          {ShroomHouse.getDefault()}
          {LadyFervie.getFrame(1)}
          {LadyFervie.getFrame(2)}
          {MoovieFervie.getFrame(
            1,
            fervieColor,
            fervieShoeColor
          )}
          {MoovieFervie.getFrame(
            2,
            fervieColor,
            fervieShoeColor
          )}
        </div>
      </div>
    );
  }
}
