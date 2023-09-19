import UtilRenderer from "../../../../UtilRenderer";
import { MemberClient } from "../../../../clients/MemberClient";
import { BaseClient } from "../../../../clients/BaseClient";

/**
 * feed creator that takes messages and circuit members,
 * retrieves any missing members, and turns the data into a usable feed
 */
export default class FeedCreator {
  /**
   * Initialize the feed creator with the base information,
   * can then call the two feed creator functions
   */
  constructor(circuit, circuitMembers, me) {
    this.name = "[FeedCreator]";
    this.circuit = circuit;
    this.circuitMembers = circuitMembers;
    this.missingMembers = [];
    this.me = me;
  }

  /**
   * Create a feed for troubleshooting messages
   * @param messages
   * @param callback
   */
  createTroubleshootFeed(messages, callback) {
    let feedEvents = this.createTroubleshootFeedEvents(
      this.circuit,
      messages
    );
    this.loadMissingMembers(messages, (members) => {
      let allMembers = this.circuitMembers.concat(members);

      let result = {
        feedEvents: feedEvents,
        members: allMembers,
      };

      callback(result);
    });
  }

  /**
   * Create a message feed for retro messages
   * @param messages
   * @param callback
   */
  createRetroFeed(messages, callback) {
    let feedEvents = this.createRetroFeedEvents(
      this.circuit,
      messages
    );
    this.loadMissingMembers(messages, (members) => {
      let allMembers = this.circuitMembers.concat(members);

      let result = {
        feedEvents: feedEvents,
        members: allMembers,
      };

      callback(result);
    });
  }

  /**
   * Load the missing member profiles by examining messages
   * @param messages
   * @param callback
   */
  loadMissingMembers(messages, callback) {
    let missingMemberNames = this.findMissingMembers(
      messages,
      this.circuitMembers,
      this.missingMembers,
      this.me
    );

    this.loadMissingMemberProfiles(
      missingMemberNames,
      callback
    );
  }

  /**
   * Load the missing members from the server, this is an async call so
   * requires a callback and the members list will be sent when all missing members
   * are loaded.
   * @param missingUsernames
   * @param callback
   */
  loadMissingMemberProfiles(missingUsernames, callback) {
    this.missingMemberLoadCount = 0;

    for (let i = 0; i < missingUsernames.length; i++) {
      MemberClient.getMember(
        missingUsernames[i],
        this,
        (arg) => {
          this.missingMemberLoadCount++;
          if (!arg.error && arg.data) {
            this.missingMembers.push(arg.data);
          } else {
            console.error("Error: " + arg.error);
          }

          if (
            this.missingMemberLoadCount ===
            missingUsernames.length
          ) {
            callback(this.missingMembers);
          }
        }
      );
    }

    if (missingUsernames.length === 0) {
      callback(this.missingMembers);
    }
  }

  /**
   * Look at the messages and identify if there's any messages from members
   * not in either of our member lists
   * @param messages
   * @param circuitMembers
   * @param missingMembers
   * @param me
   * @returns {*}
   */
  findMissingMembers(
    messages,
    circuitMembers,
    missingMembers,
    me
  ) {
    let uniqueUsernames = [];

    for (let i = 0; i < messages.length; i++) {
      let metaProps = messages[i].metaProps;
      let username =
        UtilRenderer.getUsernameFromMetaProps(metaProps);

      if (!uniqueUsernames.includes(username)) {
        uniqueUsernames.push(username);
      }
    }

    if (!uniqueUsernames.includes(me.username)) {
      uniqueUsernames.push(me.username);
    }

    let missingMemberList = [];

    for (let i = 0; i < uniqueUsernames.length; i++) {
      let member = this.getCircuitMemberForUsername(
        circuitMembers,
        missingMembers,
        uniqueUsernames[i]
      );
      if (member === null) {
        missingMemberList.push(uniqueUsernames[i]);
      }
    }
    return missingMemberList;
  }

  /**
   * Lookup the circuit member object for the username either in the circuitmember list
   * or the missing member list as a fallback, will only return null if it's in neither list
   * @param circuitMembers
   * @param missingMembers
   * @param username
   * @returns {null|*}
   */
  getCircuitMemberForUsername(
    circuitMembers,
    missingMembers,
    username
  ) {
    for (let i = 0; i < circuitMembers.length; i++) {
      if (circuitMembers[i].username === username) {
        return circuitMembers[i];
      }
    }

    for (let i = 0; i < missingMembers.length; i++) {
      if (missingMembers[i].username === username) {
        return missingMembers[i];
      }
    }

    return null;
  }

  /**
   * Creates a troubleshooting feed, starting with the fervie prompt question
   * @param circuit
   * @param troubleshootMessages
   * @returns {*}
   */
  createTroubleshootFeedEvents(
    circuit,
    troubleshootMessages
  ) {
    return this.convertToFeedEvents(
      "What do you see happening?",
      circuit.openTime,
      troubleshootMessages
    );
  }

  /**
   * Creates a retro feed starting with the retro prompt question
   * @param circuit
   * @param retroMessages
   * @returns {*}
   */
  createRetroFeedEvents(circuit, retroMessages) {
    //only create retro events, if the retro has been started
    if (circuit.retroTalkRoomId) {
      return this.convertToFeedEvents(
        "What made troubleshooting take so long?  What ideas do you have for improvement?",
        circuit.retroStartedTime,
        retroMessages
      );
    } else {
      return [];
    }
  }

  /**
   * Convert our plain messages to feed events for display in the chat
   */
  convertToFeedEvents = (
    ferviePromptStr,
    startedTimestamp,
    messages
  ) => {
    let metaProps = null,
      username = null,
      time = null,
      json = null,
      messagesLength = messages.length;

    const feedEvents = [];

    this.addFerviePrompt(
      ferviePromptStr,
      feedEvents,
      startedTimestamp
    );

    for (let i = 0, m = null; i < messagesLength; i++) {
      m = messages[i];
      metaProps = m.metaProps;
      username =
        UtilRenderer.getUsernameFromMetaProps(metaProps);
      time = UtilRenderer.getChatMessageTimeString(
        m.messageTime
      );
      json = m.data;

      if (
        m.messageType ===
        BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS
      ) {
        this.addFeedEvent(
          feedEvents,
          username,
          null,
          time,
          json.message
        );
      }
    }

    return feedEvents;
  };

  /**
   * Create the fervie "What's the problem?" prompt in chat
   * @param circuit
   */
  addFerviePrompt(ferviePromptStr, feedEvents, timeStamp) {
    let time =
      UtilRenderer.getChatMessageTimeString(timeStamp);

    this.addFeedEvent(
      feedEvents,
      "Fervie",
      null,
      time,
      ferviePromptStr
    );
  }

  /**
   * Add a new feed events array which is used to generate the list of
   * feed events in the gui which displays all of the chat messages
   * @param username
   * @param feedEvent
   * @param time
   * @param text
   */
  addFeedEvent(
    feedEvents,
    username,
    feedEvent,
    time,
    text
  ) {
    if (
      feedEvents.length > 0 &&
      feedEvents[feedEvents.length - 1] &&
      feedEvents[feedEvents.length - 1].name === username
    ) {
      feedEvent = feedEvents.pop();
      feedEvent.text.push(text);
    } else {
      feedEvent = {
        name: username,
        time: time,
        text: [text],
      };
    }

    feedEvents.push(feedEvent);

    return feedEvents;
  }
}
