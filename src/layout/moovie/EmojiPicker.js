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
      activeGroup : "😀"
    };
    this.isEnterKeyPressed = false;

    this.emojis = unicodeEmoji.getEmojisGroupedBy(EmojiPicker.categoryGroup, EmojiPicker.omitWhere);
    console.log("EMOJIS!!");
    console.log(this.emojis);
    //
    // const props = Object.keys(this.emojis);
    //
    // for (let key of props) {
    //   console.log(key);
    // }

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

  // face-emotion
  // EmojiPicker.js:48 symbols
  // EmojiPicker.js:48 objects
  // EmojiPicker.js:48 person-people
  // EmojiPicker.js:48 animals-nature
  // EmojiPicker.js:48 food-drink
  // EmojiPicker.js:48 travel-places
  // EmojiPicker.js:48 activities-events
  // EmojiPicker.js:48 flags

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {


    //each of these groups has an emoji associated with it...
    //for each group, we can create a menu item for the type of thingy.
  };


  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };

  handleChangeForSearch = () => {

  }

  handleMenuClick = (emoji) => {
    this.setState({
      activeGroup: emoji
    });
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

    return this.emojis[groupId].map((emojiDescription, i) => {
      return (<span key={i} className="emoji">{emojiDescription.emoji}</span>);
    });
  }

//{emoji: '🎃', description: 'jack-o-lantern', version: '0.6', keywords: Array(5), category: 'activities-events', …}

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

  /**
   * renders the layout of the view
   * @returns {*} - the JSX to render
   */
  render() {

    return (
      <div id="emojiPicker">
        <div className="emojiSearch">
          <Input
            id="emojiSearchInput"
            className="emojiSearchInput"
            icon='search'
            inverted
            placeholder={"Search emojis"}
            value={this.state.currentSearchValue}
            onChange={this.handleChangeForSearch}
          />
        </div>
        <div className="filterGroups">
          {this.getMenuItems()}
        </div>
        <div className="scrolling">
          {this.getEmojisForSelection()}
          {EmojiPicker.groups[0].emoji === this.state.activeGroup?
            this.getEmojisForGroup(EmojiPicker.groups[0], 1):""}
        </div>
      </div>
    );
  }
}
