//
// dto class for ChatReactionDto
//
module.exports = class ChatReactionDto {

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.chatReactionChangeType = json.chatReactionChangeType;
      this.memberId = json.memberId;
      this.messageId = json.messageId;
      this.emoji = json.emoji;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ChatReactionDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (this.messageId) return true;
    return false;
  }
};
