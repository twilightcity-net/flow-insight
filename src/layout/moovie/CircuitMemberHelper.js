/**
 * Helps manage a list of circuit members and all the join, leave, missing members stuff
 */
import {MemberClient} from "../../clients/MemberClient";
import {CircuitMemberClient} from "../../clients/CircuitMemberClient";

export default class CircuitMemberHelper {

  constructor(circuitId) {
    this.name = "[CircuitMemberHelper]";
    this.circuitId = circuitId;
    this.members = [];
    this.missingMembers = [];
    this.me = MemberClient.me;
  }

  /**
   * Load up the members list using the provided circuitId in the constructor
   * @param callback
   */
  loadMembers(callback) {
    CircuitMemberClient.getCircuitMembers(this.circuitId, this, (arg) => {
      if (!arg.error) {
        this.members = arg.data;
        console.log("loaded members, "+this.members.length);
      } else {
        console.error("Unable to load circuit members: "+arg.error);
      }
      if (callback) {
        callback(this.members);
      }
    });
  }

  /**
   * Load a specific member if they joined the room, for example
   * @param username
   * @param memberInfo
   */
  addMemberIfMissing(username, memberInfo) {
    let memberFound = this.getMemberForUsername(username);
    if (!memberFound) {
      this.missingMembers.push(memberInfo);
    }
  }

  /**
   * Load a specific member if they joined the room, for example
   * @param username
   * @param callback
   */
  loadMemberIfMissing(username, callback) {
    let memberFound = this.getMemberForUsername(username);
    if (!memberFound) {
      this.loadMissingMemberProfiles(
        [username],
        callback
      );
    } else {
      callback([]);
    }
  }

  /**
   * Loads any missing members that aren't in the listed circuit members
   * if they have messages in our feed.  These should be pre-processed
   * messages that have the username already set as a property
   * @param messages
   * @param callback
   */
  loadMissingMembers(messages, callback) {
    const uniqueUsernames = this.findUniqueUsernames(messages);
    let missingMemberNames = this.findMissingMembersList(uniqueUsernames);

    this.loadMissingMemberProfiles(
      missingMemberNames,
      callback
    );
  }

  /**
   * Looks through the messages to get a unique list of usernames used
   * @param messages
   */
  findUniqueUsernames(messages) {
    let uniqueUsernames = [];

    for (let i = 0; i < messages.length; i++) {
      const username = messages[i].username;

      if (!uniqueUsernames.includes(username)) {
        uniqueUsernames.push(username);
      }
    }
    return uniqueUsernames;
  }

  /**
   * Given a list of unique usernames find out which member profiles we're missing
   * @param uniqueUsernames
   */
  findMissingMembersList(uniqueUsernames) {
    let missingMemberList = [];

    for (let i = 0; i < uniqueUsernames.length; i++) {
      let member = this.getCircuitMemberForUsername(
        this.members,
        this.missingMembers,
        uniqueUsernames[i]
      );
      if (member === null) {
        missingMemberList.push(uniqueUsernames[i]);
      }
    }
    return missingMemberList;
  }

  /**
   * Get all the members and missing members lists combined
   */
  getAllMembers() {
    let membersList = [];
    for (let member of this.members) {
      membersList.push(member);
    }
    for (let member of this.missingMembers) {
      membersList.push(member);
    }
    return membersList;
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
   * Lookup the circuit member object for the username either in the member list
   * or the missing member list as a fallback, will only return null if it's in neither list
   * @param memberList
   * @param username
   */
  static getMemberForUsername(memberList, username) {
    for (let i = 0; i < memberList.length; i++) {
      if (memberList[i].username === username) {
        return memberList[i];
      }
    }

    return null;
  }

  /**
   * Lookup the circuit member object for the username either in the member list
   * or the missing member list as a fallback, will only return null if it's in neither list
   * @param username
   */
  getMemberForUsername(username) {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].username === username) {
        return this.members[i];
      }
    }

    for (let i = 0; i < this.missingMembers.length; i++) {
      if (this.missingMembers[i].username === username) {
        return this.missingMembers[i];
      }
    }

    return null;
  }

  createMemberByIdMap(memberList) {
    const map = new Map();
    for (let member of memberList) {
      map.set(member.memberId, member);
    }
    return map;
  }
}
