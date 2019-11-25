import React, { Component } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-gui";

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
    console.log(this.state);
    if (this.state.render3D) {
      this.engine = new BABYLON.Engine(this.canvasEl, true, {
        preserveDrawingBuffer: true,
        stencil: true
      });
      this.scene = this.createScene();
      this.runScene();
    } else {
      // TODO
    }
  }

  createScene() {
    this.engine.enableOfflineSupport = false;

    // This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
    BABYLON.Animation.AllowMatricesInterpolation = true;

    let scene = new BABYLON.Scene(this.engine);

    let camera = new BABYLON.ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 4,
      3,
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    camera.attachControl(this.canvasEl, true);

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.wheelDeltaPercentage = 0.01;

    let light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.Black();

    let light2 = new BABYLON.DirectionalLight(
      "dir01",
      new BABYLON.Vector3(0, -0.5, -1.0),
      scene
    );
    light2.position = new BABYLON.Vector3(0, 5, 5);

    // Shadows
    let shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    this.engine.displayLoadingUI();

    BABYLON.SceneLoader.ImportMesh(
      "",
      "./assets/models/",
      "dummy3.babylon",
      scene,
      (newMeshes, particleSystems, skeletons) => {
        let skeleton = skeletons[0];

        shadowGenerator.addShadowCaster(scene.meshes[0], true);
        for (var index = 0; index < newMeshes.length; index++) {
          newMeshes[index].receiveShadows = false;
        }

        let helper = scene.createDefaultEnvironment({
          enableGroundShadow: true
        });
        helper.setMainColor(BABYLON.Color3.Gray());
        helper.ground.position.y += 0.01;

        // ROBOT
        skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeleton.animationPropertiesOverride.enableBlending = true;
        skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        skeleton.animationPropertiesOverride.loopMode = 1;

        let idleRange = skeleton.getAnimationRange(
          SpiritCanvas.Animations.IDLE
        );
        let walkRange = skeleton.getAnimationRange(
          SpiritCanvas.Animations.WALK
        );
        let runRange = skeleton.getAnimationRange(SpiritCanvas.Animations.RUN);
        let leftRange = skeleton.getAnimationRange(
          SpiritCanvas.Animations.STRAFE_LEFT
        );
        let rightRange = skeleton.getAnimationRange(
          SpiritCanvas.Animations.STRAFE_RIGHT
        );

        // IDLE
        if (walkRange)
          scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);

        // UI
        let uiPanel = this.createUiPanel(scene);

        this.createButton("but1", "Play Idle", uiPanel, () => {
          if (idleRange)
            scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
        });
        this.createButton("but2", "Play Walk", uiPanel, () => {
          if (walkRange)
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        });
        this.createButton("but3", "Play Run", uiPanel, () => {
          if (runRange)
            scene.beginAnimation(skeleton, runRange.from, runRange.to, true);
        });
        this.createButton("but4", "Play Left", uiPanel, () => {
          if (leftRange)
            scene.beginAnimation(skeleton, leftRange.from, leftRange.to, true);
        });
        this.createButton("but5", "Play Right", uiPanel, () => {
          if (rightRange)
            scene.beginAnimation(
              skeleton,
              rightRange.from,
              rightRange.to,
              true
            );
        });
        this.createButton("but6", "Play Blend", uiPanel, () => {
          if (walkRange && leftRange) {
            scene.stopAnimation(skeleton);
            var walkAnim = scene.beginWeightedAnimation(
              skeleton,
              walkRange.from,
              walkRange.to,
              0.5,
              true
            );
            var leftAnim = scene.beginWeightedAnimation(
              skeleton,
              leftRange.from,
              leftRange.to,
              0.5,
              true
            );

            // Note: Sync Speed Ratio With Master Walk Animation
            walkAnim.syncWith(null);
            leftAnim.syncWith(walkAnim);
          }
        });
        this.engine.hideLoadingUI();
      }
    );

    return scene;
  }

  createUiPanel(scene) {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      scene
    );
    var uiPanel = new BABYLON.GUI.StackPanel();
    uiPanel.width = "80px";
    uiPanel.fontSize = "10px";
    uiPanel.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    uiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(uiPanel);
    return uiPanel;
  }

  createButton(name, text, uiPanel, callback) {
    var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
    button.paddingTop = "6px";
    button.width = "72px";
    button.height = "30px";
    button.color = "white";
    button.background = "green";
    button.onPointerDownObservable.add(callback);
    uiPanel.addControl(button);
  }

  runScene() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  getCanvasEl() {
    return document.getElementById("SpiritCanvas");
  }

  static get Animations() {
    return {
      IDLE: "YBot_Idle",
      WALK: "YBot_Walk",
      RUN: "YBot_Run",
      STRAFE_LEFT: "YBot_LeftStrafeWalk",
      STRAFE_RIGHT: "YBot_RightStrafeWalk",
      BLEND: ""
    };
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
