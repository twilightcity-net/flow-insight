import React, {Component} from "react";
import {List, Popup,} from "semantic-ui-react";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import FeatureToggle from "../../../shared/FeatureToggle";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";

export default class CircuitNotificationListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;
    this.state = {

    }

    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
  }

  componentDidMount() {
  }


  onClickNotification = () => {
    console.log("item clicked!");

    let circuitName = this.props.model.data.details.circuitName;
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.CIRCUIT,
      circuitName
    );

    this.browserController.makeRequest(request);
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let circuitName =  this.props.model.data.details.circuitName;
    let message = this.props.model.data.details.message;
      //displayName + " sent you a message while you were offline.";

    let popupContent = (
      <div>
        <div>
          <div>
            <b>{circuitName}</b>
          </div>
          <div>
            <i>{message}</i>
          </div>
        </div>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  render() {
    let readClass = " circuit";
    if (this.props.model.read) {
      readClass += " chat read";
    }

    let circuitName =  this.props.model.data.details.circuitName;

    const item = (<List.Item
      className={
        "notificationItem" + readClass
      }
      onClick={this.onClickNotification}
    >
      <List.Content>
        <List.Header>
          Trouble Session Auto-Paused
        </List.Header>
        <i className={"name"}>
          ({circuitName})
        </i>
      </List.Content>
    </List.Item>);

    if (this.props.model.read) {
      return item;
    } else {
      return this.getPopupContent(
        item
      );
    }

  }
}
