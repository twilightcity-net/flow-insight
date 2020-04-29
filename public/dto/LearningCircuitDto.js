/**
 * this class stores the information associated with a learning circuit on the
 * dreamtalk platform See the CircuitMemberStatusWithMembersDto class to access
 * the participant members of the learning circuit.
 */
class LearningCircuitDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.circuitName = json.circuitName;
      this.description = json.description;
      this.tags = json.tags;
      this.wtfTalkRoomName = json.wtfTalkRoomName;
      this.wtfTalkRoomId = json.wtfTalkRoomId;
      this.retroTalkRoomName = json.retroTalkRoomName;
      this.retroTalkRoomId = json.retroTalkRoomId;
      this.ownerId = json.ownerId;
      this.ownerName = json.ownerName;
      this.moderatorId = json.moderatorId;
      this.moderatorName = json.moderatorName;
      this.retroStartedTime = json.retroStartedTime;
      this.retroStartedTimeStr = json.retroStartedTimeStr;
      this.openTime = json.openTime;
      this.openTimeStr = json.openTimeStr;
      this.totalCircuitElapsedNanoTime =
        json.totalCircuitElapsedNanoTime;
      this.totalCircuitPausedNanoTime =
        json.totalCircuitPausedNanoTime;
      this.circuitState = json.circuitState;
      this.wtfOpenNanoTime = json.wtfOpenNanoTime;
      this.retroOpenNanoTime = json.retroOpenNanoTime;
      this.closeCircuitNanoTime = json.closeCircuitNanoTime;
      this.solvedCircuitNanoTime =
        json.solvedCircuitNanoTime;
      this.pauseCircuitNanoTime = json.pauseCircuitNanoTime;
      this.resumeCircuitNanoTime =
        json.resumeCircuitNanoTime;
      this.cancelCircuitNanoTime =
        json.cancelCircuitNanoTime;

      return json;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitDto' : " +
          e.message
      );
    }
  }
}

module.exports = LearningCircuitDto;
