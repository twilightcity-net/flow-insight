//
// dto class for RecentJournal
//
module.exports = class RecentJournalDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.recentIntentions = json.recentIntentions;
      this.recentProjects = json.recentProjects;
      this.recentTasksByProjectId = json.recentTasksByProjectId;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'RecentJournalDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.recentProjects != null && this.recentProjects.length > 0) return true;
    return false;
  }
};
