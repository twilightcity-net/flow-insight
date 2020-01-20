/**
 * this class is used to send a snippet from our IDE plugin
 */
class NewSnippetEvent {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.comment = json.comment;
      this.eventType = json.eventType;
      this.position = json.position;
      this.source = json.source;
      this.snippet = json.snippet;
    } catch (e) {
      throw new Error("Unable to create dto 'NewSnippetEvent' : " + e.message);
    }
  }
}

module.exports = NewSnippetEvent;
