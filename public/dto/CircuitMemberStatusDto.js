/**
 * this class stores the the client members whom have joined a room within a circuit on the network. These
 * are pushed to the client using the gridtalk service.
 */
class CircuitMemberStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.memberId = json.memberId;
      this.displayName = json.displayName;
      this.fullName = json.fullName;
      this.wtfJoinTime = json.wtfJoinTime;
      this.wtfRoomStatus = json.wtfRoomStatus;
      this.retroJoinTime = json.retroJoinTime;
      this.retroRoomStatus = json.retroRoomStatus;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitDto' : " +
          e.message
      );
    }
  }
}

module.exports = CircuitMemberStatusDto;
