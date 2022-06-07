//
// dto class for BuddyEventDto
//
module.exports = class BuddyEventDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.buddyEventType = json.buddyEventType;
      this.buddy = json.buddy;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'BuddyEventDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.buddy != null)
      return true;
    return false;
  }
};
