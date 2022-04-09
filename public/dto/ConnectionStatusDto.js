/**
 * dto class for SimpleStatus
 * @type {ConnectionStatusDto}
 */
module.exports = class ConnectionStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.message = json.message;
      this.status = json.status;
      this.connectionId = json.connectionId;
      this.orgId = json.orgId;
      this.teamId = json.teamId;
      this.memberId = json.memberId;

      this.orgName = json.orgName;
      this.orgDomainName = json.orgDomainName;

      this.participatingOrgs = json.participatingOrgs;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ConnectionStatusDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (this.status === "VALID") return true;
    return false;
  }
};
