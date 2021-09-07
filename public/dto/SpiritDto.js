//
// dto class for SpiritDto
//
module.exports = class SpiritDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.spiritId = json.spiritId;
      this.xpSummary = json.xpSummary;
      this.activeSparkLinks = json.activeSparkLinks;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'XPSummaryDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.xpSummary != null && this.xpSummary != null)
      return true;
    return false;
  }
};
