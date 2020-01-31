/**
 * This class stores the information about the learning circuit as well as the existing participating members
 * whom joined the circuit. This list of member will contain there status of the rooms. These
 * are dtos which will be pushed by the talk service into the client
 */
class LearningCircuitWithMembersDto {
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
      this.moderatorName = json.moderatorName;
      this.moderatorId = json.moderatorId;
      this.openTime = json.openTime;
      this.openTimeStr = json.openTimeStr;
      this.closeTime = json.closeTime;
      this.closeTimeStr = json.closeTimeStr;
      this.circuitStatus = json.circuitStatus;
      this.lastOnHoldTime = json.lastOnHoldTime;
      this.lastOnHoldTimeStr = json.lastOnHoldTimeStr;
      this.lastResumeTime = json.lastResumeTime;
      this.lastResumeTimeStr = json.lastResumeTimeStr;
      this.secondsBeforeOnHold = json.secondsBeforeOnHold;
      this.circuitMembers = json.circuitMembers;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitWithMembersDto' : " + e.message
      );
    }
  }
}

module.exports = LearningCircuitWithMembersDto;
