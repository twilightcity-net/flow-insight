//
// dto class for FervieDto
//
module.exports = class FervieDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.sparkId = json.sparkId;
      this.xpSummary = json.xpSummary;
      this.activeSparkLinks = json.activeSparkLinks;

      this.fervieColor = json.fervieColor;
      this.fervieSecondaryColor = json.fervieSecondaryColor;
      this.fervieTertiaryColor = json.fervieTertiaryColor;
      this.fervieAccessory = json.fervieAccessory;
      this.fervieName = json.fervieName;

      this.username = json.username;
      this.onlineStatus = json.onlineStatus;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'FervieDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.sparkId != null && this.xpSummary != null)
      return true;
    return false;
  }
};
