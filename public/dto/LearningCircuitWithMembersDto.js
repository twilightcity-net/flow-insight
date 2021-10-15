const LearningCircuitDto = require("LearningCircuitDto");
/**
 * This class stores the information about the learning circuit as well as the existing participating members
 * whom joined the circuit. This list of member will contain there status of the rooms. These
 * are dtos which will be pushed by the gridtalk service into the client
 */
class LearningCircuitWithMembersDto extends LearningCircuitDto {
  constructor(json) {
    super(json);
    try {
      this.circuitParticipants = json.circuitParticipants;
      this.activeWtfRoomMembers = json.activeWtfRoomMembers;
      this.activeRetroRoomMembers =
        json.activeRetroRoomMembers;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitWithMembersDto' : " +
          e.message
      );
    }
  }
}

module.exports = LearningCircuitWithMembersDto;
