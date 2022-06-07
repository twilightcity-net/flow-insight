//
// dto class for NotificationDto
//
module.exports = class NotificationDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.id = json.id;
      this.fromMemberId = json.fromMemberId;
      this.fromUsername = json.fromUsername;
      this.fromFervieName = json.fromFervieName;
      this.fromDisplayName = json.fromDisplayName;
      this.fromFullName = json.fromFullName;

      this.createdDate = json.createdDate;

      this.notificationType = json.notificationType;
      this.requestId = json.requestId;

      this.isRead = json.isRead;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NotificationDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.id != null)
      return true;
    return false;
  }
};
