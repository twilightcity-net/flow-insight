import React, { Component } from "react";
import {
  Icon,
  Button,
  Image,
  Menu,
  Progress,
  Segment,
  Transition,
  Popup
} from "semantic-ui-react";
import * as THREE from "three";
import { DataModelFactory } from "../models/DataModelFactory";
import { SidePanelViewController } from "../perspective/SidePanelViewController";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";

export default class SpiritPanel extends Component {
  constructor(props) {
    super(props);
    this.state = this.loadState();

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );

    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
    console.log(this.props.xpSummary);
  }

  /// performs a simple calculation for dynamic height of panel
  calculateSpiritHeight() {
    let spiritHeight = this.calculatePanelHeight() - 100;

    if (spiritHeight > 250) {
      spiritHeight = 250;
    }
    return spiritHeight;
  }

  openSpiritPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.SPIRIT,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        spiritVisible: true
      });
    }, this.state.animationDelay);
  }

  openBadgesPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BADGES,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        badgesVisible: true
      });
    }, this.state.animationDelay);
  }

  /// updates display to show spirit content
  handleSpiritClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  /// updates the display to show the badges content
  handleBadgesClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  componentDidMount = () => {
    console.log("componentDidMount");

    if (this.mount) {
      this.initScene();
    }

    this.myController.configureSpiritPanelListener(
      this,
      this.onRefreshActivePerspective
    );
  };

  onRefreshActivePerspective() {
    console.log("SpiritPanel - onRefreshActivePerspective!");

    let activeMenuItem = this.myController.activeSubmenuSelection;

    if (activeMenuItem === SidePanelViewController.SubmenuSelection.SPIRIT) {
      this.openSpiritPanel();
    } else {
      this.openBadgesPanel();
    }
  }

  componentWillReceiveProps = nextProps => {
    let flameRating = nextProps.flameRating;

    let flameString = "0";
    if (flameRating > 0) {
      flameString = "+" + flameRating;
    } else if (flameRating < 0) {
      flameString = flameRating;
    }

    this.setState({
      flameString: flameString
    });
  };

  initScene = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene();
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 4;
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#130A00");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //ADD CUBE
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: "#433F81" });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    console.log("start");
    this.start();
  };

  handleClickForRage = () => {
    console.log("Rage!");
    this.spiritModel.adjustFlame(-1);
  };

  handleClickForYay = () => {
    console.log("Yay!");
    this.spiritModel.adjustFlame(+1);
  };

  componentWillUnmount() {
    console.log("componentWillUnmount");
    this.myController.configureSpiritPanelListener(this, null);
    if (this.mount) {
      this.cleanupScene();
    }
  }

  cleanupScene = () => {
    this.stop();
    if (this.mount.contains(this.renderer.domElement)) {
      this.mount.removeChild(this.renderer.domElement);
    }
  };

  start = () => {
    if (!this.frameId) {
      console.log("starting");
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  /// performs a simple calculation for dynamic height of panel
  calculatePanelHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 8,
      contentHeader: 34,
      bottomMenuHeight: 28
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader -
      heights.bottomMenuHeight
    );
  }

  /// laods the stored state from parent or use default values
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.SPIRIT,
        spiritVisible: true,
        badgesVisible: false,
        animationType: "fly down",
        animationDelay: 350,
        level: 0,
        percentXP: 99,
        totalXP: 99999,
        title: ""
      };
    }
    return state;
  }

  handleClickForChainLink = () => {
    console.log("Link this Torchie!" + this.spiritModel);
    this.spiritModel.linkThisTorchie(this.props.spiritId);
  };

  handleClickForChainUnlink = () => {
    console.log("Unlink!" + this.spiritModel);

    this.spiritModel.unlink(this.props.spiritId);
  };

  isLinkedToMe = () => {
    let linkedToMe = false;
    if (this.hasActiveLinks()) {
      let spiritLink = null;
      for (var i in this.props.activeSpiritLinks) {
        spiritLink = this.props.activeSpiritLinks[i];

        if (spiritLink.friendSpiritId == this.props.me.id) {
          linkedToMe = true;
          break;
        }
      }
    }
    return linkedToMe;
  };

  hasActiveLinks = () => {
    return (
      this.props.activeSpiritLinks != null &&
      this.props.activeSpiritLinks.length > 0
    );
  };

  /// renders the console sidebar panel of the console view
  render() {
    const { activeItem } = this.state;

    let linkIcon = (
      <Popup
        trigger={
          <Icon
            link
            name="linkify"
            className="chainLink"
            onClick={this.handleClickForChainLink}
          />
        }
        content={<div className="tooltipPurple">Link this Torchie!</div>}
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let unlinkIcon = (
      <Popup
        trigger={
          <Icon
            link
            name="unlinkify"
            className="chainUnlink"
            onClick={this.handleClickForChainUnlink}
          />
        }
        content={<div className="tooltipRed">Break Links</div>}
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let busyLinkIcon = (
      <Popup
        trigger={<Icon link name="gg" className="chainLink" />}
        content={
          <div className="tooltipRed">
            Busy <i>(Already Linked)</i>
          </div>
        }
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let activeLinkIcon = "";
    if (this.props.isMe) {
      if (this.hasActiveLinks()) {
        //there's at least one spirit link, so show the unlink icon
        activeLinkIcon = unlinkIcon;
      }
      //if my torchie isn't linked, don't show any icon
    } else {
      if (this.isLinkedToMe()) {
        activeLinkIcon = unlinkIcon;
      } else if (this.hasActiveLinks()) {
        activeLinkIcon = busyLinkIcon;
      } else {
        activeLinkIcon = linkIcon;
      }
    }

    let spiritImage = "";

    if (this.state.flameString >= 0) {
      spiritImage = (
        <Image
          height={this.calculateSpiritHeight()}
          centered
          src="./assets/images/spirit.png"
        />
      );
    } else if (this.state.flameString < 0) {
      spiritImage = (
        <Image
          height={this.calculateSpiritHeight()}
          centered
          src="./assets/images/painSpirit.png"
        />
      );
    }

    const spiritContent = (
      <div className="spiritContent">
        <div className="spiritBackground">
          <div className="level">
            <b>{this.props.torchieOwner}'s Spirit</b>
            {activeLinkIcon}
          </div>

          {spiritImage}

          <div className="level">
            <div className="infoTitle">Torchie {this.props.title}</div>
            <div className="infoLevel">Level {this.props.level}</div>
          </div>

          <Popup
            trigger={
              <Progress
                size="small"
                percent={this.props.percentXP}
                color="violet"
                inverted
                progress
              />
            }
            content={
              <div className="xpCount">
                Total XP:{" "}
                <i>
                  {this.props.xpSummary.totalXP} /{" "}
                  {this.props.xpSummary.xpRequiredToLevel}
                </i>
              </div>
            }
            inverted
            hideOnScroll
            position="top left"
          />
        </div>
        <div className="ui two bottom attached buttons">
          <button
            className="ui icon button rageButton"
            tabIndex="0"
            onClick={this.handleClickForRage}
          >
            <Image centered src="./assets/images/wtf/24x24.png" />
          </button>
          <button
            className="ui icon button yayButton"
            tabIndex="1"
            onClick={this.handleClickForYay}
          >
            <Image centered src="./assets/images/yay/24x24.png" />
          </button>
        </div>
      </div>
    );
    const badgesContent = (
      <div className="badgesContent">No Badges Earned :(</div>
    );
    return (
      <div
        id="component"
        className="consoleSidebarPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.SPIRIT}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.SPIRIT
              }
              onClick={this.handleSpiritClick}
            />
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.BADGES}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.BADGES
              }
              onClick={this.handleBadgesClick}
            />
          </Menu>
          <Segment inverted style={{ height: this.calculatePanelHeight() }}>
            <Transition
              visible={this.state.spiritVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {spiritContent}
            </Transition>
            <Transition
              visible={this.state.badgesVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {badgesContent}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
