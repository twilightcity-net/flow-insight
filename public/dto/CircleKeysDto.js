//
// dto class for CircleKeysDto
//
module.exports = class CircleKeysDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.circleId = json.circleId;

      this.hypercoreFeedId = json.hypercoreFeedId;
      this.hypercorePublicKey = json.hypercorePublicKey;
      this.hypercoreSecretKey = json.hypercoreSecretKey;
    } catch (e) {
      throw new Error("Unable to create dto 'CircleKeyDto' : " + e.message);
    }
  }

  isValid() {
    if (this.circleId) return true;
    return false;
  }
};
