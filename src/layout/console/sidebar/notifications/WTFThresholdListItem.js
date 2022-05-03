import React, {Component} from "react";
import {Label, List, Popup,} from "semantic-ui-react";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";

export default class WTFThresholdListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;

    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let teamMemberName =
      this.props.model.data.learningCircuitDto.ownerName;

    let message =
      teamMemberName + " has been troubleshooting for over 20 minutes, maybe you can help?";

    if (this.props.model.canceled) {
      message = "Troubleshooting session resolved."
    }

    let popupContent = (
      <div>
        <div>
          <div>
            <b>Friction Alarm</b>
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

  onClickItem = () => {
    console.log("item clicked!");

    let circuit = this.props.model.data.learningCircuitDto;

    console.log("circuit name = "+circuit.circuitName);
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.CIRCUIT,
      circuit.circuitName
    );

    this.browserController.makeRequest(request);
  };

  render() {

    let circuit = this.props.model.data.learningCircuitDto;
    let fullName = circuit.ownerName;

    let unreadClass = "";
    if (!this.props.model.read) {
      unreadClass = " unread";
    }

    let canceledClass = "";
    if (this.props.model.canceled) {
      canceledClass = " canceled";
    }

    return this.getPopupContent(
      <List.Item
        className={
          "notificationItem" + unreadClass + canceledClass
        }
        key={this.props.id}
        onClick={this.onClickItem}
      >
        <List.Content>
          <List.Header className={canceledClass}>
            Troubleshooting &gt; 20min
          </List.Header>
          <i className={"name" + canceledClass}>
            ({fullName})
          </i>
        </List.Content>
      </List.Item>
    );
  }
}
