import React, {Component} from "react";
import {Popup, TextArea} from "semantic-ui-react";
import EmojiPicker from "./EmojiPicker";
import {FervieClient} from "../../clients/FervieClient";

/**
 * this component is the input box for the always-on-top chat overlay panel
 */
export default class ChatInput extends Component {

  static chatInputId = "chatInput";

  /**
   * Initialize the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ChatInput]";
    this.state = {
      chatValue: "",
      isEmojiPickerOpen: false,
      skinToneSelection: null
    };

    this.lastOpened = null;
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
    this.isEnterKeyPressed = false;

    this.refreshRecentEmojis();

  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isConsoleOpen && !this.props.isConsoleOpen) {
      this.setState({
        isEmojiPickerOpen: false
      });
    }

    if (prevState.isEmojiPickerOpen !== this.state.isEmojiPickerOpen) {
      document.getElementById(ChatInput.chatInputId).focus();
    }
  }


  /**
   * handles our key press for when we use the enter or return keys. check out
   * text input for sql injection or if null or non characters. This sets a
   * boolean flag for enter key press and will toggle it when the request
   * from gridtime returns. This throttles the member to send 1 message.
   */
  handleEnterKey = () => {
    let text = this.state.chatValue;
    console.log("text = " + text);

    if (text === "" || this.isEnterKeyPressed) {
      return false;
    }

    this.isEnterKeyPressed = true;

    this.setState({
      chatValue: "",
    });

    console.log("about to call onEnterKey")
    this.props.onEnterKey(
      text,
      this.delegateEnterKeyCallback
    );
  };

  /**
   * called when gridtime has sent the talk message from pressing enter.
   */
  delegateEnterKeyCallback = () => {
    this.isEnterKeyPressed = false;
  };

  /**
   * When chat text is changed, update the state value
   */
  handleChangeText = (event) => {
    this.setState({
      chatValue: event.target.value,
    });
  };

  /**
   * Handle when a key is pressed so we can detect enter
   * @param e
   */
  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      e.preventDefault();
      this.handleEnterKey();
    }
  };

  handleBlur = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const endTime = window.performance.now();
      let elapsed = null;
      if (this.lastOpened) {
        elapsed = endTime-this.lastOpened;
      }

      if (elapsed && elapsed > 200) {
        this.setState({
          isEmojiPickerOpen: false
        });
      }
    }, 200);

  }

  onRefreshEmojiWindow = () => {
    this.lastOpened = window.performance.now();
    document.getElementById(ChatInput.chatInputId).focus();
  }

  onClickEmojiSearch = () => {
    this.lastOpened = window.performance.now();
  }

  onBlurEmojiSearch = () => {
    this.handleBlur();
  }

  refreshRecentEmojis() {
    FervieClient.getTopEmojiTracks(this, (arg) => {
      console.log("EMOJIS LOADED!");
      console.log(arg.data);
      this.setState({
        recentEmojis: arg.data
      });
    });
  }

  pasteEmojiInChat = (emoji) => {
    //track usage of this emoji, so we can update our frequently used list
    FervieClient.trackEmoji(emoji, this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
      } else {
        console.log("Emoji tracked!");
        this.refreshRecentEmojis();
      }
    });

    this.setState((prevState) => {
      return { chatValue: prevState.chatValue + emoji }
    });
  }

  setSkinToneSelection = (skinEmoji) => {
    this.setState({skinToneSelection: skinEmoji});
  }

  onClickEmojiButton = () => {
    console.log("onClickEmojiButton");
    if (!this.state.isEmojiPickerOpen) {
      this.lastOpened = window.performance.now();
    } else {
      this.lastOpened = null;
    }

    this.setState((prevState) => {
      return {isEmojiPickerOpen: !prevState.isEmojiPickerOpen}
    });
  }

  getEmojiPickerPopupAction() {
    return (<Popup
      position='top right'
      basic
      inverted
      offset={[-10, 10]}
      open={this.state.isEmojiPickerOpen}
      trigger={
        (<span className="emojiPickerButton" onClick={this.onClickEmojiButton} >
        {this.getEmojiPickerSvg()}
        </span>)
      }
    >
      <Popup.Content>
        <EmojiPicker recentEmojis={this.state.recentEmojis}
                     onRefreshEmojiWindow={this.onRefreshEmojiWindow}
                     onClickEmojiSearch={this.onClickEmojiSearch}
                     onBlurEmojiSearch={this.onBlurEmojiSearch}
                     pasteEmojiInChat={this.pasteEmojiInChat}
                     skinToneSelection={this.state.skinToneSelection}
                     setSkinToneSelection={this.setSkinToneSelection}/>
      </Popup.Content>
    </Popup>);
  }

  /**
   * renders the layout of the view
   * @returns {*} - the JSX to render
   */
  render() {

    return (
      <div className="windowFooter">
       <TextArea
              id={ChatInput.chatInputId}
              className="chatInput"
              value={this.state.chatValue}
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeText}
              onBlur={this.handleBlur}
        />
          {this.getEmojiPickerPopupAction()}
      </div>
    );
  }

  getEmojiPickerSvg() {
    return (<svg preserveAspectRatio="xMinYMin meet" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50">
      <defs>
        <g id="Layer0_0_FILL">
          <path className="emojiColor" fill="#6600FF" stroke="none" d="
M 28.9 17.7
Q 28.3 18.3 28.3 19.15 28.3 20 28.9 20.6 29.5 21.2 30.35 21.2 31.2 21.2 31.8 20.6 32.4 20 32.4 19.15 32.4 18.3 31.8 17.7 31.2 17.1 30.35 17.1 29.5 17.1 28.9 17.7
M 21.2 20.6
Q 21.8 20 21.8 19.15 21.8 18.3 21.2 17.7 20.6 17.1 19.75 17.1 18.9 17.1 18.3 17.7 17.7 18.3 17.7 19.15 17.7 20 18.3 20.6 18.9 21.2 19.75 21.2 20.6 21.2 21.2 20.6 Z"/>
        </g>

        <path id="Layer0_0_1_STROKES" className="emojiColor" stroke="#6600FF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 44.4 25
Q 44.4 33.05 38.7 38.75 33 44.4 25 44.4 17 44.4 11.3 38.75 5.6 33.05 5.6 25 5.6 17 11.3 11.3 17 5.65 25 5.65 33 5.65 38.7 11.3 44.4 17 44.4 25 Z
M 34.25 29.75
Q 33.8392578125 31.621484375 31.65 33 29 34.75 25.2 34.75 21.4 34.75 18.7 33 16.5513671875 31.621484375 16.15 29.75"/>
      </defs>

      <g transform="matrix( 1, 0, 0, 1, 0,0) ">
        <use xlinkHref="#Layer0_0_FILL"/>

        <use xlinkHref="#Layer0_0_1_STROKES"/>
      </g>
    </svg>);
  }
}
