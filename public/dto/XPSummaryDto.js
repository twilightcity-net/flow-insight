//
// dto class for XPSummaryDto
//
module.exports = class XPSummaryDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.level = json.level;
      this.totalXP = json.totalXP;
      this.xpProgress = json.xpProgress;
      this.xpRequiredToLevel = json.xpRequiredToLevel;
      this.title = json.title;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'XPSummaryDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.level != null && this.totalXP != null) return true;
    return false;
  }
};