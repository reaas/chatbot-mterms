import { TeamsActivityHandler } from "botbuilder";
import * as debug from "debug";
const log = debug("msteams");

export class PersonalChatBot extends TeamsActivityHandler {
  history: String[] = [];
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      await context.sendActivity(`history: ${this.history}`);
      this.history.push(context.activity.text);
      await next();
    });
  }
}