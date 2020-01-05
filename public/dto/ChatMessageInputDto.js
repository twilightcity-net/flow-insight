/**
 * this class is used to send a chat message to another client or room on our network
 */
class ChatMessageInputDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.chatMessage = json.chatMessage;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ChatMessageInputDto' : " + e.message
      );
    }
  }
}

module.exports = ChatMessageInputDto;
