//
// dto class for FervieSeatEventDto
//
module.exports = class FervieSeatEventDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.seatClaim = json.seatClaim;
      this.fervieSeatEventType = json.fervieSeatEventType;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'FervieSeatEventDto' : " + e.message
      );
    }
  }
  isValid() {
    if (this.seatClaim != null)
      return true;
    return false;
  }
};
