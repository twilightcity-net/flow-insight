/**
 * this class is used to send a snippet from our IDE plugin
 */
class NewSnippetEvent {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.comment = json.chatMessage;
      this.eventType = json.chatMessage;
      this.position = json.chatMessage;
      this.source = json.chatMessage;
      this.snippet = json.chatMessage;
    } catch (e) {
      throw new Error("Unable to create dto 'NewSnippetEvent' : " + e.message);
    }
  }
}

module.exports = NewSnippetEvent;
