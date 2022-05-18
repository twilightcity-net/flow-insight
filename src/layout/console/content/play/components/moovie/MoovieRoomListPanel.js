import React, {Component} from "react";
import {Button, List,} from "semantic-ui-react";
import MoovieListItem from "./MoovieListItem";
import GameState from "../hud/GameState";

export default class MoovieRoomListPanel extends Component {

  componentWillUnmount() {
  }

  getMovieItem(key, people, timer) {
    return <MoovieListItem id={key} people={people} timer={timer} onClickItem={() => {this.openMoovieDoor(key)}}/>
  }

  openMoovieDoor(key) {
    this.props.globalHud.closeMooviePicker();
    //TODO this will have a uuid for whatever the movie is
    this.props.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, key);
  }


  render() {
    return (<div id="playDialog">
      <div className={"title"}>Moovie Rooms</div>
      <div className="dialogContent">
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          {this.getMovieItem(1, 4, "Not Started")}
          {this.getMovieItem(2, 2, "Not Started")}
          {this.getMovieItem(3, 1, "00:01:14")}
          {this.getMovieItem(4, 2, "00:05:13")}
          {this.getMovieItem(5, 2, "00:12:12")}
          {this.getMovieItem(6, 3, "00:14:45")}
          {this.getMovieItem(7, 4, "00:21:22")}
          {this.getMovieItem(8, 2, "00:35:15")}
          {this.getMovieItem(9, 1, "00:42:03")}
          {this.getMovieItem(10, 3, "00:14:04")}
        </List>
      </div>
      <div>
        <Button color="violet" className={"createButton"}>
          Create a Moovie Room
        </Button>
      </div>
    </div>);

  }
}
