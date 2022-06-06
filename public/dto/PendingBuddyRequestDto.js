//
// dto class for PendingBuddyRequestDto
//
module.exports = class PendingBuddyRequestDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.buddyRequestId = json.buddyRequestId;
      this.email = json.email;
      this.toMemberId = json.toMemberId;

      this.toUsername = json.toUsername;
      this.toFervieName = json.toFervieName;

      this.status = json.status;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'PendingBuddyRequestDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.buddyRequestId != null)
      return true;
    return false;
  }
};
