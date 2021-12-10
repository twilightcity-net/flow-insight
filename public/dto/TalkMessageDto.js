/**
 * Object that is recieved by the REST interface for talk
 */
module.exports = class TalkMessageDto {
  /**
   * builds our most used dto from the json in the socket push
   * @param json
   */
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.uri = json.uri;

      this.messageTime = json.messageTime;
      this.nanoTime = json.nanoTime;
      this.metaProps = json.metaProps;
      this.messageType = json.messageType;
      this.messageContext = json.messageContext;

      this.data = json.data;
    } catch (e) {
      throw new Error(
        "Unable to create json : " + e.message
      );
    }
  }
};
