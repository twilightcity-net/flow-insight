import React, {Component} from "react";

export default class SpiritCanvas extends Component {
    constructor(props) {
        super(props);
        console.log(props.spirit);
    }

    render() {
        return (
            <canvas id="SpiritCanvas" height={this.props.height} width={this.props.width}/>
        );
    }
}