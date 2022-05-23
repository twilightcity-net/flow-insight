/**
 * this class is used to send a chat message to another client or room on our network
 */
class ChatMessageDetailsDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.message = json.message;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ChatMessageDetailDto' : " +
          e.message
      );
    }
  }
}

module.exports = ChatMessageDetailsDto;
