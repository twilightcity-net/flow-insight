//
// dto class for FeedMessageDto
//
module.exports = class FeedMessageDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.circleId = json.id;
      this.timePosition = json.timePosition;
      this.circleMemberDto = json.circleMemberDto;
      this.messageType = json.messageType;

      //optional fields populated based on type
      this.message = json.message;
      this.fileName = json.fileName;
      this.filePath = json.filePath;
      this.snippetSource = json.snippetSource;
      this.snippet = json.snippet;
    } catch (e) {
      throw new Error("Unable to create dto 'FeedMessageDto' : " + e.message);
    }
  }

  isValid() {
    if (this.circleId) return true;
    return false;
  }
};
