import React, {Component} from "react";

export default class Carousel extends Component {
  render () {
    return (
        <div className="carousel">
          <ImageSlide url={ imgUrl } />
        </div>
    );
  }
}