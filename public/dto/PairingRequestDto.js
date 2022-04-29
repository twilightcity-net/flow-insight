//
// dto class for PairingRequestDto
//
module.exports = class PairingRequestDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.pairingRequestType = json.pairingRequestType;

      this.fromMemberId = json.fromMemberId;
      this.fromUsername = json.fromUsername;
      this.fromFullName = json.fromFullName;
      this.fromDisplayName = json.fromDisplayName;

      this.toMemberId = json.toMemberId;
      this.toUsername = json.toUsername;
      this.toFullName = json.toFullName;
      this.toDisplayName = json.toDisplayName;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'PairingRequestDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (
      this.fromMemberId != null &&
      this.toMemberId != null
    )
      return true;
    return false;
  }
};
