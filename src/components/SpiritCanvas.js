import React, {Component} from "react";
import * as BABYLON from "babylonjs";

export default class SpiritCanvas extends Component {
    constructor(props) {
        super(props);
        this.spirit = props.spirit;
    }

    componentDidMount() {
        this.canvasEl = this.getCanvasEl();
        this.engine = new BABYLON.Engine( this.canvasEl, true, {preserveDrawingBuffer: true, stencil: true});
        this.scene = this.createScene();
        this.runScene();
    }

    createScene() {
        let scene = new BABYLON.Scene(this.engine);
        let camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(this.canvasEl, false);
        let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        sphere.position.y = 1;
        var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
        return scene;
    }

    runScene() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    getCanvasEl() {
        return document.getElementById("SpiritCanvas");
    }

    render() {
        return (
            <canvas id="SpiritCanvas" height={this.props.height} width={this.props.width}/>
        );
    }
}