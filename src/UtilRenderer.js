export default class UtilRenderer {
  static getDateTimeString(date) {
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  }
}
