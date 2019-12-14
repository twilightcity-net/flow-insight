import React, { Component } from "react";

export default class SpiritCanvas extends Component {
  constructor(props) {
    super(props);
    this.render3d = props.render3d;
    this.spirit = props.spirit;
    this.height = props.height;
    this.width = props.width;
  }

  componentDidMount() {
    this.canvasEl = this.getCanvasEl();
    if (this.render3D === "true") {
      // TODO implement unity3d models and scene into this element
    } else {
      this.paintTorchieHappy();
    }
  }

  componentWillReceiveProps = nextProps => {
    this.updateTorchieImage(nextProps.flameString);
  };

  updateTorchieImage(flameString) {
    let spiritImage = "";

    if (flameString >= 0) {
      spiritImage = "./assets/images/spirit.png";
    } else if (flameString < 0) {
      spiritImage = "./assets/images/painSpirit.png";
    }

    let image = new Image();
    image.onload = () => {
      this.getCanvasEl()
        .getContext("2d")
        .drawImage(image, 0, 0);
    };
    image.src = spiritImage;
  }

  paintTorchieHappy() {
    let image = new Image();
    image.onload = () => {
      this.getCanvasEl()
        .getContext("2d")
        .drawImage(image, 0, 0);
    };
    image.src = "./assets/images/spirit.png";
  }

  getCanvasEl() {
    return document.getElementById("SpiritCanvas");
  }

  render() {
    return (
      <canvas
        id="SpiritCanvas"
        height={this.props.height}
        width={this.props.width}
      />
    );
  }
}
