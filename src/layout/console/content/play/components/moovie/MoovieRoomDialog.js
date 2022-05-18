import React, {Component} from "react";
import {Button, Input, List,} from "semantic-ui-react";
import MoovieListItem from "./MoovieListItem";
import GameState from "../hud/GameState";

export default class MoovieRoomDialog extends Component {

  constructor(props) {
    super(props);

    this.state = {
      creatingNewRoom: false,
      currentTitleValue: "",
      currentYearValue: "",
      currentLinkValue: ""
    }
  }

  componentDidMount() {
    this.props.globalHud.registerListener("MoovieRoomDialog", this.onOpenCloseMoovieDialog);
  }

  componentWillUnmount() {
    this.props.globalHud.removeListener("MoovieRoomDialog");
  }

  onOpenCloseMoovieDialog = () => {
    if (!this.props.globalHud.getMooviePickerOpen()) {
      this.closeNewMoovieRoomForm();
    }
  }

  getMovieItem(key, people, timer) {
    return <MoovieListItem id={key} people={people} timer={timer} onClickItem={() => {this.openMoovieDoor(key)}}/>
  }

  openMoovieDoor(key) {
    this.props.globalHud.closeMooviePicker();
    //TODO this will have a uuid for whatever the movie is
    this.props.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, key);
  }

  openNewMoovieRoomForm = () => {
    console.log("openNewMoovieRoomForm");
    this.setState({
      creatingNewRoom: true
    })
    this.props.globalHud.disableKeysWhileFormIsOpen();
  }

  closeNewMoovieRoomForm = () => {
    console.log("closeNewMoovieRoomForm");
    this.setState({
      creatingNewRoom: false
    })
    this.props.globalHud.enableKeys();
  }

  getMoovieListContent() {
    return (<div id="playDialog">
      <div className={"title"}>Moovie Rooms</div>
      <div className="listContent">
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
        <Button color="violet" className={"createButton"} onClick={this.openNewMoovieRoomForm}>
          Create a Moovie Room
        </Button>
      </div>
    </div>);
  }

  handleChangeForTitle = (e, { value }) => {
    this.setState({
      currentTitleValue: value,
    });
  }

  handleChangeForYear = (e, { value }) => {
    this.setState({
      currentYearValue: value,
    });
  }

  handleChangeForLink = (e, { value }) => {
    this.setState({
      currentLinkValue: value,
    });
  }

  getCreateNewRoomDialogContent() {
    return (<div id="playDialog" style={{opacity: "100%"}}>
      <div className={"title"}>Create Moovie Room</div>
      <div className="dialogContent">
        <div>
          <Input
            id="playTitleInput"
            className="playDialogInput"
            fluid
            inverted
            placeholder={"Title of Moovie"}
            value={this.state.currentTitleValue}
            onChange={this.handleChangeForTitle}
          />
          <Input
            id="playTitleInput"
            className="playDialogInput"
            fluid
            inverted
            placeholder={"Year"}
            value={this.state.currentYearValue}
            onChange={this.handleChangeForYear}
          />
        </div>
        <div>
          <Input
            id="playTitleInput"
            className="playDialogInput"
            fluid
            inverted
            placeholder={"https://link/to/moovie"}
            value={this.state.currentLinkValue}
            onChange={this.handleChangeForLink}
          />
        </div>
      </div>
      <div>
        <Button color="grey" className={"cancelButton"} onClick={this.closeNewMoovieRoomForm}>
          Cancel
        </Button>
        <Button color="violet" className={"createButton"}>
          Create
        </Button>
      </div>
    </div>);
  }

  render() {
    if (this.state.creatingNewRoom) {
      return this.getCreateNewRoomDialogContent();
    } else {
      return this.getMoovieListContent();
    }
  }
}
