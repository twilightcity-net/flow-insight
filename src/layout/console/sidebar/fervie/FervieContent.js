import React, {Component} from "react";
import FeatureToggle from "../../../shared/FeatureToggle";
import {DimensionController} from "../../../../controllers/DimensionController";
import FervieCanvas from "./FervieCanvas";
import {Button, Dropdown, Icon, Input, Popup, Progress} from "semantic-ui-react";
import {HexColorPicker} from "react-colorful";
import UtilRenderer from "../../../../UtilRenderer";

export default class FervieContent extends Component {
  constructor(props) {
    super(props);

    this.whatToColorOptions = [
      {
        key: 0,
        value: FervieContent.Colorables.FUR,
        text: FervieContent.Colorables.FUR,
      },
      {
        key: 1,
        value: FervieContent.Colorables.SHOES,
        text: FervieContent.Colorables.SHOES,
      },
      {
        key: 2,
        value: FervieContent.Colorables.ACCESSORY,
        text: FervieContent.Colorables.ACCESSORY,
      },
    ];


    this.state = {
      pickColorVisible: false,
      editedFervieColor: this.props.fervieColor,
      editedFervieSecondaryColor: this.props.fervieSecondaryColor,
      editedFervieTertiaryColor: this.props.fervieTertiaryColor,
      whatToColor : FervieContent.Colorables.FUR,
      color: this.props.fervieColor,
      isEditingName: false,
      currentFervieName: this.props.fervieName
    }

  }

  static get Colorables() {
    return {
      FUR: "Fur",
      SHOES: "Shoes",
      ACCESSORY: "Accessory",
    };
  }


  /**
   * When color change is done, save the details on the server
   */
  handleColorDoneOnClick = () => {
    let fervieColor = this.state.editedFervieColor;
    let fervieSecondaryColor = this.state.editedFervieSecondaryColor;
    let fervieTertiaryColor = this.state.editedFervieTertiaryColor;

    //make sure we apply the last color setting, and figure out what needs to be sent to server
    if (this.state.whatToColor === FervieContent.Colorables.FUR) {
      fervieColor = this.state.color;
    } else if (this.state.whatToColor === FervieContent.Colorables.SHOES) {
      fervieSecondaryColor = this.state.color;
    } else if (this.state.whatToColor === FervieContent.Colorables.ACCESSORY) {
      fervieTertiaryColor = this.state.color;
    }

    this.setState({
      pickColorVisible: false,
      editedFervieColor: fervieColor,
      editedFervieSecondaryColor: fervieSecondaryColor,
      editedFervieTertiaryColor: fervieTertiaryColor
    });

    this.props.onUpdateFervieColors(fervieColor, fervieSecondaryColor, fervieTertiaryColor);

  };

  handleChangeForWhatToColor = (e, { value }) => {
    //when its changed, whatever the color was set to for the prior color, need to save this
    if (this.state.whatToColor === FervieContent.Colorables.FUR) {
      //existing color state, we need to copy out to the particular variable type
      this.setState({
        editedFervieColor: this.state.color,
      });
    } else if (this.state.whatToColor === FervieContent.Colorables.SHOES) {
      this.setState({
        editedFervieSecondaryColor: this.state.color,
      });
    } else if (this.state.whatToColor === FervieContent.Colorables.ACCESSORY) {
      this.setState({
        editedFervieTertiaryColor: this.state.color,
      });
    }

    let newColor = null;
    if (value === FervieContent.Colorables.FUR) {
      newColor = this.state.editedFervieColor;
    } else if (value === FervieContent.Colorables.SHOES) {
      newColor = this.state.editedFervieSecondaryColor;
    } else if (value === FervieContent.Colorables.ACCESSORY) {
      newColor = this.state.editedFervieTertiaryColor;
    }

    this.setState({
      color: newColor,
      whatToColor: value,
    });
  };

  /**
   * gets button panel when color picker is open
   * @returns {*}
   */
  getColorPickerButtonPanel = () => {
    return (
      <div className="fervieColorButtons">
        <Button
          className="cancelButton"
          onClick={this.handleCancelColorClick}
          size="mini"
          color="grey"
        >
          Cancel
        </Button>
        <Button
          className="okayButton"
          onClick={this.handleColorDoneOnClick}
          size="mini"
          color="violet"
        >
          Okay
        </Button>
      </div>
    );
  };

  getColorPickerFervieContent() {
    let whatToColorAvailable = [];

    whatToColorAvailable.push(this.whatToColorOptions[0]);
    whatToColorAvailable.push(this.whatToColorOptions[1]);
    if (this.props.fervieAccessory) {
      whatToColorAvailable.push(this.whatToColorOptions[2]);
    }

    return (
      <div className="fervieContent">
        <div className="chooseColors">
          <b>Choose Colors</b>
        </div>

        <div
          style={{
            margin: "auto",
            height: DimensionController.getMiniFervieCanvasHeight(),
            width: DimensionController.getMiniFervieCanvasWidth(),
          }}
        >
          <FervieCanvas
            haircolor={this.state.editedFervieColor}
            shoecolor={this.state.editedFervieSecondaryColor}
            accessorycolor={this.state.editedFervieTertiaryColor}
            accessory={this.props.fervieAccessory}
            render3d={false}
          />
        </div>

        <div>
          <Dropdown
            id="whatToColor"
            className="whatToColor"
            placeholder="Choose what to color"
            options={whatToColorAvailable}
            selection
            fluid
            upward
            value={this.state.whatToColor}
            onChange={this.handleChangeForWhatToColor}
          />
        </div>

        <div
          style={{
            height: DimensionController.getColorPickerDivHeight(),
          }}
        >
          <HexColorPicker
            color={this.state.color}
            onChange={(color) => {
              if (this.state.whatToColor === FervieContent.Colorables.FUR) {
                this.setState({
                  color: color,
                  editedFervieColor: color,
                });
              } else if (this.state.whatToColor === FervieContent.Colorables.SHOES) {
                this.setState({
                  color: color,
                  editedFervieSecondaryColor: color,
                });
              } else if (this.state.whatToColor === FervieContent.Colorables.ACCESSORY) {
                this.setState({
                  color: color,
                  editedFervieTertiaryColor: color,
                });
              }
            }}
          />
        </div>
        {this.getColorPickerButtonPanel()}
      </div>
    );
  }


  /**
   * gets a 2d canvas to draw our fervie on
   * @returns {*}
   */
  getFervieCanvas = () => {
    return (
      <div
        style={{
          height:
            DimensionController.getFervieCanvasHeight(),
          width: DimensionController.getFervieCanvasWidth(),
        }}
      >
        <FervieCanvas
          haircolor={this.props.fervieColor}
          shoecolor={this.props.fervieSecondaryColor}
          accessorycolor={this.props.fervieTertiaryColor}
          accessory={this.props.fervieAccessory}
          render3d={false}
        />
      </div>
    );
  };

  getNormalFervieContent() {

    let fervieTitle;
    if (FeatureToggle.isMoovieApp) {
      fervieTitle = this.getMoovieFervieTitle();
    } else {
      fervieTitle = this.getFervieTitle();
    }

    return (
      <div className="fervieContent">
        {fervieTitle}
        {this.getFervieCanvas()}
        {this.getFervieButtonPanel()}
      </div>
    );
  }



  handleChooseColorOnClick = () => {
    this.setState({
      pickColorVisible: true,
      editedFervieColor: this.props.fervieColor,
      editedFervieSecondaryColor: this.props.fervieSecondaryColor,
      editedFervieTertiaryColor: this.props.fervieTertiaryColor,
      whatToColor : FervieContent.Colorables.FUR,
      color: this.props.fervieColor
    });
  };

  handleCancelColorClick = () => {
    this.setState({
      pickColorVisible: false
    });
  }

  /**
   * gets button panel below our fervie
   * @returns {*}
   */
  getFervieButtonPanel = () => {
    return (
      <div className="fervieButtons">
        <Button
          icon
          size="mini"
          color="violet"
          onClick={() => {
            this.props.gotoSkillsOrAccessoriesPanel();
          }}
        >
          <Icon name="gem outline" />
        </Button>
        <Button
          onClick={this.handleChooseColorOnClick}
          size="mini"
          color="violet"
        >
          Choose Colors
        </Button>
      </div>
    );
  };


  /**
   * renders the fervie title content for the panel
   * @returns {*}
   */
  getFervieTitle = () => {
    let displayName = "Your Fervie", //this.me.displayName,
      xpPercent = UtilRenderer.getXpPercent(
        this.props.xpSummary.xpProgress,
        this.props.xpSummary.xpRequiredToLevel
      ),
      xpDisplay = UtilRenderer.getXpDetailDisplay(
        this.props.xpSummary
      );

    return (
      <div className="fervieTitle">
        <div className="level">
          <div className="infoTitle">
            {displayName}
          </div>
          <div className="infoLevel">
            <b>Level {this.props.xpSummary.level} </b>
            <br />
            <i>({this.props.xpSummary.title})</i>
          </div>
        </div>

        <Popup
          trigger={
            <Progress
              size="small"
              percent={xpPercent}
              color="violet"
              inverted
              progress
            />
          }
          content={
            <div className="xpCount">{xpDisplay}</div>
          }
          inverted
          hideOnScroll
          position="bottom right"
        />
      </div>
    );
  };


  /**
   * When we hit the enter key, should accept the new fervie name
   * @param e
   */
  handleKeyPressForNameChange = (e) => {
    if (e.charCode === 13) {
      this.props.onUpdateFervieName(this.state.currentFervieName);
      this.setState({
        isEditingName: false
      });

      this.props.handleGlobalHudInputUnlock();
    }

  };

  /**
   * Handles our editing of the fervie name
   * @param e - the event that was generated by user gui event
   * @param value
   */
  handleChangeForNameChange = (e, { value }) => {
    this.setState({
      currentFervieName: value,
    });
  };


  /**
   * Handles blurring (cancelling) of our name change
   */
  handleNameChangeBlur = () => {
    this.setState( {
      isEditingName: false,
      currentFervieName: this.props.fervieName
    });
    this.props.handleGlobalHudInputUnlock();
  };

  /**
   * Handles blurring (cancelling) of our name change
   */
  handleNameChangeFocus = () => {
    this.props.handleGlobalHudInputLock();
  };

  onStartEditing = () => {
    console.log("editing!");
    this.setState({
      isEditingName: true
    });
  }


  /**
   * renders the moovie version of fervie title content
   * @returns {*}
   */
  getMoovieFervieTitle = () => {
    let displayName = this.props.fervieName;
    if (!displayName) {
      displayName = "Your Fervie";
    }

    if (!this.state.isEditingName) {
      return (<Popup
        trigger={
          <div className="fervieName" onClick={this.onStartEditing}>
            {displayName}
          </div>}
        content={"Click to edit name"}
        position="bottom center"
        inverted
        hideOnScroll
      />);
    } else {
      return (<Input
        id="fervieNameInput"
        className="fervieNameInput"
        fluid
        inverted
        placeholder="Name your Fervie"
        value={this.state.currentFervieName}
        onKeyPress={this.handleKeyPressForNameChange}
        onChange={this.handleChangeForNameChange}
        onBlur={this.handleNameChangeBlur}
        onFocus={this.handleNameChangeFocus}
        autoFocus
      />)
    }

  };


  /**
   * renders the fervie part of the panel
   * @returns {*}
   */
  getFervieContent = () => {
    if (this.state.pickColorVisible === false) {
      return this.getNormalFervieContent();
    } else {
      return this.getColorPickerFervieContent();
    }
  };

  render() {
    return this.getFervieContent();
  }
}
