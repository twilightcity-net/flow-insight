//
// dto class for FervieSeatMappingDto
//
module.exports = class FervieSeatMappingDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.memberId = json.memberId;
      this.username = json.username;
      this.fervieColor = json.fervieColor;

      this.rowNumber = json.rowNumber;
      this.seatNumber = json.seatNumber;


    } catch (e) {
      throw new Error(
        "Unable to create dto 'FervieSeatMappingDto' : " + e.message
      );
    }
  }
  isValid() {
    if (this.memberId != null)
      return true;
    return false;
  }
};
