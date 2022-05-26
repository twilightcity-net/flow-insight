import React, {Component} from "react";
import * as unicodeEmoji from 'unicode-emoji';
import {Input, Menu} from "semantic-ui-react";

/**
 * this component handles the popup emoji picker
 */
export default class EmojiPicker extends Component {

  /**
   * Initialize the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[EmojiPicker]";
    this.state = {
      chatValue: "",
      currentSearchValue: "",
      activeGroup : "😀",
      filteredEmojis: null
    };
    this.isEnterKeyPressed = false;

    this.groupedEmojis = unicodeEmoji.getEmojisGroupedBy(EmojiPicker.categoryGroup, EmojiPicker.omitWhere);
    this.allEmojis = unicodeEmoji.getEmojis(EmojiPicker.omitWhere);

    console.log("EMOJIS!!");
    console.log(this.groupedEmojis);

  }

  static categoryGroup = 'category';

  static omitWhere = { versionAbove: '12.0' };

  static groups = [
    {
      name: "Smileys and People",
      groupIds: ["face-emotion", "person-people"],
      emoji: "😀"
    },
    {
      name: "Animals and Nature",
      groupIds: ["animals-nature"],
      emoji: "🐮"
    },
    {
      name: "Food and Drink",
      groupIds: ["food-drink"],
      emoji: "🍕"
    },
    {
      name: "Activity",
      groupIds: ["activities-events"],
      emoji: "⚽"
    },
    {
      name: "Travel and Places",
      groupIds: ["travel-places"],
      emoji: "🏝️"
    },
    {
      name: "Objects",
      groupIds: ["objects"],
      emoji: "🧢"
    },
    {
      name: "Symbols",
      groupIds: ["symbols"],
      emoji: "✅"
    },
    {
      name: "Flags",
      groupIds: ["flags"],
      emoji: "🚩"
    },
  ];

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {

  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };

  handleChangeForSearch = (e, { value }) => {
    this.setState({
      currentSearchValue: value,
    });

    if (value.length > 0) {
      this.updateFilteredEmojis(value);
    } else {
      this.setState({
        filteredEmojis: null
      });
    }


  };

  /**
   * When we change the search value, look through the available emojis,
   * and put together a filtered list based on the search results
   * @param searchValue
   */
  updateFilteredEmojis(searchValue) {
    let matchingEmojis = [];
    for (let emoji of this.allEmojis) {
      if (emoji.description.startsWith(searchValue)) {
        matchingEmojis.push(emoji);
      } else {
        for (let keyword of emoji.keywords) {
          if (keyword.includes(searchValue)) {
            matchingEmojis.push(emoji);
            break;
          }
        }
      }
    }

    this.setState({
      filteredEmojis: matchingEmojis
    });
  }

  //{emoji: '🎃', description: 'jack-o-lantern', version: '0.6', keywords: Array(5), category: 'activities-events', …}



  handleMenuClick = (emoji) => {
    this.setState({
      activeGroup: emoji
    });
    this.props.onRefreshEmojiWindow();
  }

  handleEmojiClick = (emoji) => {
    this.props.onRefreshEmojiWindow();
    this.props.pasteEmojiInChat(emoji);
  }

  handleSearchClick = () => {
    console.log("search click");
    this.props.onClickEmojiSearch();
  }

  getMenuItems() {
    return (
      <Menu pointing secondary inverted>
        {
          EmojiPicker.groups.map((group, i) => {
            return (
              <Menu.Item
                key={i}
                name={group.emoji}
                active={this.state.activeGroup === group.emoji}
                onClick={() => {
                  this.handleMenuClick(group.emoji);
                }}
              />
            );
          })
        }
      </Menu>
      );
  }

  getEmojisForGroup(group, index) {
    let groupId = group.groupIds[index];

    return this.groupedEmojis[groupId].map((emojiDescription, i) => {
      return (<span key={i} className="emoji" onClick={() => this.handleEmojiClick(emojiDescription.emoji)}>{emojiDescription.emoji}</span>);
    });
  }

  getEmojisForFilteredList(emojiList) {
    return emojiList.map((emojiDescription, i) => {
      return (<span key={i} className="emoji" onClick={() => this.handleEmojiClick(emojiDescription.emoji)}>{emojiDescription.emoji}</span>);
    });
  }

  getEmojisForSelection() {
    const group = this.getActiveGroup();

    return this.getEmojisForGroup(group, 0);
  }

  getActiveGroup() {
    for (let group of EmojiPicker.groups) {
      if (group.emoji === this.state.activeGroup) {
        return group;
      }
    }
    return EmojiPicker.groups[0];
  }

  onClickEmojiWindow = () => {
    this.props.onClickEmojiWindow();
  }


  /**
   * renders the layout of the view
   * @returns {*} - the JSX to render
   */
  render() {

    let emojiList = "";
    let emojiListExtra = "";

    if (this.state.filteredEmojis !== null) {
      emojiList = this.getEmojisForFilteredList(this.state.filteredEmojis);
    } else {
      emojiList = this.getEmojisForSelection();

      if (EmojiPicker.groups[0].emoji === this.state.activeGroup) {
        emojiListExtra = this.getEmojisForGroup(EmojiPicker.groups[0], 1);
      }
    }

    return (
      <div id="emojiPicker" >
        <div className="emojiSearch">
          <Input
            id="emojiSearchInput"
            className="emojiSearchInput"
            icon='search'
            inverted
            placeholder={"Search emojis"}
            value={this.state.currentSearchValue}
            onChange={this.handleChangeForSearch}
            onClick={this.handleSearchClick}
          />
        </div>
        <div className="filterGroups">
          {this.getMenuItems()}
        </div>
        <div className="scrolling">
          {emojiList}
          {emojiListExtra}
        </div>
      </div>
    );
  }


}
