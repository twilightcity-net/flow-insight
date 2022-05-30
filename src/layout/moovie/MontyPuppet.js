import React from "react";
import {TalkToClient} from "../../clients/TalkToClient";
import {MemberClient} from "../../clients/MemberClient";
import moment from "moment";
import {MoovieClient} from "../../clients/MoovieClient";

/**
 * this is a helper class for running the Monty puppet scripts
 */
export default class MontyPuppet {

  static get MoovieState() {
    return {
      OPEN: "OPEN",
      STARTED: "STARTED",
      PAUSED: "PAUSED",
      CLOSED: "CLOSED"
    }
  }

  getMontyIntroMessage(moovie) {
    let forTitle = "";
    let circuitState = null;
    if (moovie) {
      forTitle = " for "+moovie.title;
      circuitState = moovie.circuitState;
    }

    let text1 = "Hi, I'm Monty!";
    let text2 = "I'll be your moovie host"+forTitle +
      ", and help everyone get synced up so we can watch the moovie together! ";
    let text3 = "";

    if (!circuitState || circuitState === MontyPuppet.MoovieState.OPEN) {
      text3 = "To get ready, put your moovie in full-screen mode, " +
        "start playing to make sure it's loaded, and then pause at 00:00. " +
        "Once everyone is ready, click the Monty icon in the left hand corner, " +
        "and select the 'Start Moovie' option."
    } else if (circuitState === MontyPuppet.MoovieState.STARTED) {
      text3 = "It looks like the moovie is already started.  Once you put your moovie in full-screen mode, " +
        "find the timer in the upper right hand corner of this window.  You can sync up your moovie to the timer to " +
        "get your moovie playing at the same time as everyone else. " +
        "If it's okay with folks in the room, you can also ask if it's alright to pause while you get synced up."
    } else if (circuitState === MontyPuppet.MoovieState.PAUSED) {
      text3 = "It looks like the moovie is currently paused.  Once you put your moovie in full-screen mode, " +
        "find the timer in the upper right hand corner of the window.  You can sync up your moovie to the timer to " +
        "get your moovie playing at the same time as everyone else. " +
        "Once everyone is ready, click the Monty icon in the left hand corner, " +
        "and select the 'Resume' option."
    }

    const msg1 = this.createMontyMessage(text1, 1);
    const msg2 = this.createMontyMessage(text2, 2);
    const msg3 = this.createMontyMessage(text3, 3);

    return [msg1, msg2, msg3];

  }

  runMontyStartMoovieScript(moovie, callAfterGo) {
    if (!moovie) return;

    MoovieClient.claimPuppet(moovie.id, this, (arg) => {
      if (!arg.error) {
        this.sendReadySetGoAndStartMoovie(moovie.talkRoomId, callAfterGo);
      } else {
        console.error("Puppet claim failed: "+arg.error);
      }
    });
  }

  sendReadySetGoAndStartMoovie(talkRoomId, callAfterGo) {
    let text1 = "Are you ready?";
    let text2 = "Alright, when I say, everyone start their moovies!";
    let text3 = "Ready...";
    let text4 = "Set...";
    let text5 = "Go go go!";

    setTimeout(() => {
      this.sendPuppetMessage(talkRoomId, text1);
      setTimeout(() => {
        this.sendPuppetMessage(talkRoomId, text2);
        setTimeout(() => {
          this.sendPuppetMessage(talkRoomId, text3);
          setTimeout(() => {
            this.sendPuppetMessage(talkRoomId, text4);
            setTimeout(() => {
              this.sendPuppetMessage(talkRoomId, text5);
              callAfterGo();
            }, 3000);
          }, 3000);
        }, 3000);
      }, 2000);
    }, 100);
  }


  sendPuppetMessage(talkRoomId, text) {
    TalkToClient.publishPuppetChatToRoom(talkRoomId, text, this, (arg) => {
      if (arg.error) {
        console.error("Error sending puppet message:" + arg.error);
      }
    });
  }

  createMontyMessage(text, id) {
    const me = MemberClient.me;
    let username = "notloaded";
    if (me) {
      username = me.username;
    }

    return {
      id: id,
      username: username,
      time: moment().utc().local().calendar(),
      texts: [{id:id, message:text, reactions:[]}],
      isMe: true,
      isPuppet: true,
      isLocalOnly: true};
  }
}
