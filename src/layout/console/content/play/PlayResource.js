import React, {Component} from "react";
import {DimensionController} from "../../../../controllers/DimensionController";
import p5 from "p5";
import FervieWalkUp from "./components/FervieWalkUp";
import AnimationLoader from "./components/AnimationLoader";
import AnimationId from "./components/AnimationId";


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
    this.height = DimensionController.getHeightFor(DimensionController.Components.PLAY_PANEL);
    this.width = DimensionController.getFullRightPanelWidth();
    this.farAwayXMargin = 200;
    this.yMargin = 30;
    this.imageMap = [];
    this.scaleCount = 1;
    this.loadCount = 0;

    const sketch = (s) => {
      s.setup = () => {
        s.createCanvas(this.width, this.height);
        s.frameRate(24);

        this.fervieGif = this.animationLoader.getAnimationImage(s, AnimationId.Animation.FervieWalkUp, 1, 100);
        this.fervieGif2 =  this.animationLoader.getAnimationImage(s, AnimationId.Animation.FervieWalkUp, 1, 300);

        for (let i = 1; i <= 24; i++) {
          this.animationLoader.getAnimationImage(s, AnimationId.Animation.FervieWalkUp, i, 220);
        }

      }


      s.draw = () => {
        s.background('#77aaff');
        // s.circle(10, 10, 10);

        //this.fervieGif.resize(100,0);
        //so each side of a building should fade into the background, with the vanishing point
        //at width/2
        // s.quad(0, this.yMargin,
        //   0, this.height - this.yMargin,
        //   this.width/2 , this.height/2,
        //   this.width/2 , this.height/2)
        //
        // s.quad(this.width/2 , this.height/2,
        //   this.width/2 , this.height/2,
        //   this.width, this.yMargin,
        //   this.width, this.height - this.yMargin)

        // s.fill('orange');

        s.fill('#777777')
        s.rect(0, this.height/2, this.width, this.height);

        s.fill('purple');

        s.quad(0, this.yMargin,
          0, this.height - this.yMargin,
          this.width/2 - this.farAwayXMargin, this.getYBottom(this.width/2 - this.farAwayXMargin),
          this.width/2 - this.farAwayXMargin, this.getYTop(this.width/2 - this.farAwayXMargin))

        s.quad(this.width/2 + this.farAwayXMargin, this.getYBottom(this.width/2 - this.farAwayXMargin),
          this.width/2 + this.farAwayXMargin, this.getYTop(this.width/2 - this.farAwayXMargin),
          this.width, this.yMargin,
          this.width, this.height - this.yMargin)

        //animationFrames go from 1 to 24
        let animationFrame = ((s.frameCount - 1)%24) + 1;

        let animatedImage = this.animationLoader.getAnimationImage(s, AnimationId.Animation.FervieWalkUp, animationFrame, 220);

        s.image(animatedImage,this.width/2 - 110, this.height/2 - 20);

      }


    }

    this.sketchInstance = new p5(sketch, 'mySketch');
  }


  getYBottom(x) {
    let slope = -1*(this.height - this.yMargin - this.height/2)/(this.width/2);
    return (slope * x) + (this.height - this.yMargin);
  }

  getYTop(x) {
    let slope = -1*(this.yMargin - this.height/2)/(this.width/2);
    return slope * x + this.yMargin;
  }
  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(DimensionController.Components.PLAY_PANEL);
    let fervieColor = "#8C6EFA";
    let fervieShoeColor = "#CC00CC";

    return (
      <div id="component" className="playLayout" style={{height: height}}>
        <div id="mySketch"/>
        <div id="fervies">
          {FervieWalkUp.getFrame( 1, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 2, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 3, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 4, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 5, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 6, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 7, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 8, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 9, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 10, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 11, fervieColor, fervieShoeColor)}
          {FervieWalkUp.getFrame( 12, fervieColor, fervieShoeColor)}
        </div>
      </div>
    );
  }
}
