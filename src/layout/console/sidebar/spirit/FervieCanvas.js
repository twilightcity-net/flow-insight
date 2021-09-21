import React, { Component } from "react";
import { DimensionController } from "../../../../controllers/DimensionController";

/**
 * the 2d html canvas react component class used to load the graphic art for Fervie
 */
export default class FervieCanvas extends Component {
  /**
   * builds the canvas from properties
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.render3d = props.render3d;
    this.height = props.height;
    this.width = props.width;
    this.flameRating = 0;
  }

  /**
   * should render in 3d?
   */
  componentDidMount() {
    this.canvasEl = this.getCanvasEl();
    if (this.render3D === "true") {
      // TODO implement unity3d models and scene into this element
    } else {
      this.updateFervieImage(this.flameRating);
    }
  }

  /**
   * update the properties
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    this.updateFervieImage(this.flameRating);
  };

  /**
   * updates the fervie image on the screen
   * @param flameString
   */
  updateFervieImage(flameRating) {
    // let spiritImage = "",
    //   height = DimensionController.getFervieCanvasHeight(),
    //   width = DimensionController.getFervieCanvasWidth();
    //
    // if (flameRating >= 0) {
    //   spiritImage = "./assets/images/fervie_idle_in_TC.gif";
    // } else if (flameRating < 0) {
    //   spiritImage = "./assets/images/fervie_idle_in_TC.gif";
    // }
    //
    // let image = new Image();
    // image.onload = () => {
    //   let canvas = this.getCanvasEl();
    //   if (canvas) {
    //     this.getCanvasEl()
    //       .getContext("2d")
    //       .drawImage(image, 0, 0, width, height);
    //   }
    // };
    // image.src = spiritImage;
  }

  /**
   * gets the htm canvase element
   * @returns {HTMLElement} - the dom from the viewport
   */
  getCanvasEl() {
    return document.getElementById("FervieCanvas");
  }

  /**
   * renders the component on the screen
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <img
        id="FervieCanvas"
        height={DimensionController.getFervieCanvasHeight()}
        width={DimensionController.getFervieCanvasWidth()}
        src={"./assets/images/fervie_idle_in_TC.gif"}
        alt="loading..."
      />

      //
      // <canvas
      //   id="FervieCanvas"
      //   height={DimensionController.getFervieCanvasHeight()}
      //   width={DimensionController.getFervieCanvasWidth()}
      // />
    );
  }
}
