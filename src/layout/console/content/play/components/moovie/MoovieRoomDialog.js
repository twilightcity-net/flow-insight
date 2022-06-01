import React, {Component} from "react";
import {Button, Input, List,} from "semantic-ui-react";
import MoovieListItem from "./MoovieListItem";
import GameState from "../hud/GameState";
import {MoovieClient} from "../../../../../../clients/MoovieClient";
import UtilRenderer from "../../../../../../UtilRenderer";

export default class MoovieRoomDialog extends Component {

  constructor(props) {
    super(props);

    this.state = {
      creatingNewRoom: false,
      moovies: [],
      currentTitleValue: "",
      currentYearValue: "",
      currentLinkValue: ""
    }
  }

  componentDidMount() {
    this.props.globalHud.registerListener("MoovieRoomDialog", this.onOpenCloseMoovieDialog);
    this.loadMoovieCircuits();
  }

  componentWillUnmount() {
    this.props.globalHud.removeListener("MoovieRoomDialog");
  }

  onOpenCloseMoovieDialog = () => {
    if (!this.props.globalHud.getMooviePickerOpen()) {
      this.closeNewMoovieRoomForm();
    } else {
      this.loadMoovieCircuits();
    }
  }

  loadMoovieCircuits() {
    MoovieClient.getMoovieCircuits(this, (arg) => {
      console.log("moovies retrieved!");
      if (!arg.error) {
        this.setState({
          moovies: arg.data
        });
      } else {
        console.error("Error: "+arg.error);
      }
    });
  }

  getMovieItem(key, people, timer, title, year, serviceProviderType) {
    return <MoovieListItem key={key} id={key} people={people} timer={timer} title={title} year={year} serviceProviderType={serviceProviderType} onClickItem={() => {this.openMoovieDoor(key)}}/>
  }

  openMoovieDoor(key) {
    this.props.globalHud.closeMooviePicker();
    this.props.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, key);
    this.props.globalHud.setGameStateProperty(GameState.Property.MOOVIE_SEATING_MAP, null);

    MoovieClient.joinMoovie(key, this, (arg) => {
      if (arg.error) {
        console.error("Error while joining moovie: "+arg.error);
      } else {
        console.log("Joining moovie");
        MoovieClient.getSeatMappings(key, this, (arg) => {
          if (arg.error) {
            console.error("Error getting seat mappings: "+arg.error);
          } else {
            this.props.globalHud.setGameStateProperty(GameState.Property.MOOVIE_SEATING_MAP, arg.data);
          }
        });
      }
    });
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

  createNewMoovie = () => {
    console.log("createNewMoovie");
    MoovieClient.createMoovieCircuit(
      this.state.currentTitleValue,
      this.state.currentYearValue,
      this.state.currentLinkValue,
      this, (arg) => {
        console.log("created!");
        if (!arg.error) {
          this.closeNewMoovieRoomForm();
          this.props.globalHud.closeMooviePicker();
          this.props.globalHud.setGameStateProperty(GameState.Property.OPENED_MOVIE_ID, arg.data.id);
          this.props.globalHud.setGameStateProperty(GameState.Property.MOOVIE_SEATING_MAP, []);

          this.setState((prevState => {
            prevState.moovies.push(arg.data);
            return {
              moovies: prevState.moovies
            }
          }));

          console.log(arg.data);
        } else {
          //TODO handle the error on the dialog page
          console.error("Error:" +arg.error);
        }
      });
  }

  getTimer(moovie) {
    return UtilRenderer.getTimerFromMoovieCircuit(moovie);
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
          {this.state.moovies.map((moovie, i) => {
            return this.getMovieItem(moovie.id, moovie.memberCount, this.getTimer(moovie), moovie.title, moovie.year, moovie.serviceProviderType);
          })}

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
        <Button color="violet" className={"createButton"} onClick={this.createNewMoovie}>
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
