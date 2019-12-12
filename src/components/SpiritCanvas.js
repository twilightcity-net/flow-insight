import React, { Component } from "react";

const { remote } = window.require("electron");

export default class SpiritCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      render3D: remote.getGlobal("App").render3D
    };
    this.spirit = props.spirit;
  }

  componentDidMount() {
    this.canvasEl = this.getCanvasEl();
    if (this.state.render3D === "true") {
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
