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
import MoovieRoomDialog from "./moovie/MoovieRoomDialog";
import {Sunglasses} from "./accessories/Sunglasses";
import AccessoryManager from "./accessories/AccessoryManager";
import {Heartglasses} from "./accessories/Heartglasses";
import GameState from "./hud/GameState";

/**
 * this component is the tab panel wrapper for the game content
 * @copyright Twilight City, Inc. 2022©®™√
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
    this.initialFramesToLoad = 2;
    this.isInitialized = false;

    this.height = DimensionController.getHeightFor(DimensionController.Components.PLAY_PANEL);
    this.width = DimensionController.getFullRightPanelWidth();

    this.globalHud = new GlobalHud(this.animationLoader, this.width, this.height);
  }

  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    const sketch = (p5) => {
      p5.setup = () => {
        p5.createCanvas(this.width, this.height);
        p5.frameRate(24);

        this.globalHud.preload(p5);

        this.environment = new EnvironmentMap(
          this.animationLoader,
          this.width,
          this.height,
          this.globalHud
        );
        if (this.props.initialEnvironment) {
          this.environment.setInitialEnvironment(this.props.initialEnvironment);
        }

        if (this.props.initialMoovieId) {
          this.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, this.props.initialMoovieId);
        }

        this.environment.preload(p5);

        this.accessoryManager = new AccessoryManager(this.props.me, this.animationLoader);

        this.fervieSprite = new FervieSprite(
          this.animationLoader,
          this.accessoryManager,
          this.globalHud,
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

        if (this.initialFramesToLoad > 0) {
          this.initialFramesToLoad--;
        } else if (!this.isInitialized) {
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
    if (this.sketchInstance) {
      this.sketchInstance.remove();
    }
    if (this.globalHud) {
      this.globalHud.unload();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.me !== this.props.me) {
      console.log("me changed!");
      this.accessoryManager.updateMember(this.props.me);
      this.fervieSprite.reloadImages(this.sketchInstance);

    }
  }

  /**
   * renders the game
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.PLAY_PANEL
    );
    let fervieAccessory = null;
    let fervieColor = FervieColors.defaultFervieColor;
    let fervieShoeColor = FervieColors.defaultShoeColor;
    let fervieAccessoryColor = FervieColors.defaultSunglassColor;

    if (this.props.me) {
      fervieColor = this.props.me.fervieColor;
      fervieShoeColor = this.props.me.fervieSecondaryColor;
      fervieAccessoryColor = this.props.me.fervieTertiaryColor;
      fervieAccessory = this.props.me.fervieAccessory;
    }

    return (
      <div
        id="component"
        className="playLayout"
        style={{ height: height }}
      >
        <div id="mySketch" />
        <MoovieRoomDialog globalHud={this.globalHud}/>
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
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            2,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            3,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            4,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            5,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            6,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            7,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            8,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            9,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            10,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            11,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkRight.getFrame(
            12,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            1,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            2,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            3,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            4,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            5,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            6,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            7,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            8,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            9,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            10,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            11,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
          )}
          {FervieWalkDown.getFrame(
            12,
            fervieColor,
            fervieShoeColor,
            fervieAccessory
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
          {Sunglasses.getFervieRight(fervieAccessoryColor)}
          {Sunglasses.getFervieDown(fervieAccessoryColor)}
          {Heartglasses.getFervieRight(fervieAccessoryColor)}
          {Heartglasses.getFervieDown(fervieAccessoryColor)}
        </div>
      </div>
    );
  }
}
