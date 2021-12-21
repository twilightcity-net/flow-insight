/**
 * this class stores the the client members whom have joined a room within a circuit on the network. These
 * are pushed to the client using the talknet service.
 */
class CircuitMemberStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.memberId = json.memberId;
      this.displayName = json.displayName;
      this.fullName = json.fullName;
      this.username = json.username;

      this.lastActive = json.lastActive;
      this.onlineStatus = json.onlineStatus;

      this.fervieColor = json.fervieColor;
      this.fervieSecondaryColor = json.fervieSecondaryColor;
      this.fervieTertiaryColor = json.fervieTertiaryColor;
      this.fervieAccessory = json.fervieAccessory;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitDto' : " +
          e.message
      );
    }
  }
}

module.exports = CircuitMemberStatusDto;
