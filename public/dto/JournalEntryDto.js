//
// dto class for Journal Intentions
//
module.exports = class JournalEntryDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.position = json.position;
      this.description = json.description;
      this.projectId = json.projectId;
      this.taskId = json.taskId;
      this.taskName = json.taskName;
      this.projectName = json.projectName;
      this.taskSummary = json.taskSummary;
      this.flameRating = json.flameRating;
      this.finishStatus = json.finishStatus;
      this.journalEntryType = json.journalEntryType;
      this.linked = json.linked;
    } catch (e) {
      throw new Error("Unable to create dto 'JournalEntryDto' : " + e.message);
    }
  }

  isValidToken() {
    if (this.status === "VALID") return true;
    return false;
  }
};
