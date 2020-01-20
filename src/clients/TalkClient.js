import { BaseClient } from "./BaseClient";

export class TalkClient extends BaseClient {
  constructor(scope) {
    super(scope, TalkClient.constructor.name);
  }

  static instance;

  static init(scope) {
    if (!TalkClient.instance) {
      TalkClient.instance = new TalkClient(scope);
    }
  }
}
//publishChatToRoom
//publishSnippetToRoom
//publishScreenshotToRoom
