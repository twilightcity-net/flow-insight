//
// dto class for MoovieCircuitDto
//
module.exports = class MoovieCircuitDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.id = json.id;
      this.talkRoomId = json.talkRoomId;
      this.title = json.title;
      this.year = json.year;
      this.link = json.link;
      this.description = json.description;
      this.imdbRating = json.imdbRating;
      this.serviceProviderType = json.serviceProviderType;
      this.ownerUsername = json.ownerUsername;
      this.circuitState = json.circuitState;
      this.createdTime = json.createdTime;
      this.startTime = json.startTime;
      this.totalCircuitPausedNanoTime = json.totalCircuitPausedNanoTime;
      this.totalCircuitElapsedNanoTime = json.totalCircuitElapsedNanoTime;
      this.memberCount = json.memberCount;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'MoovieCircuitDto' : " + e.message
      );
    }
  }

  isValid() {
    return this.id != null;

  }
};
