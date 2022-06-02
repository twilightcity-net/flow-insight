//
// dto class for BuddiesListDto
//
module.exports = class BuddiesListDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.buddies = json.buddies;
      this.pendingBuddyRequests = json.pendingBuddyRequests;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'BuddiesListDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.buddies != null)
      return true;
    return false;
  }
};
