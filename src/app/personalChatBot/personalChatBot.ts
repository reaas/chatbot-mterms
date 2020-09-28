import { CardFactory, TeamsActivityHandler } from "botbuilder";
import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
const log = debug("msteams");

export class PersonalChatBot extends TeamsActivityHandler {
  history: String[] = [];
  dbClient = new DBClient();
  adaptiveCard = new AdaptiveCards.AdaptiveCard();

  isinCard = require("../cards/isin.json");

  constructor() {
    super();
    this.onMessage(async (context, next) => {
      await this.dbClient.connect();
      const regexp = new RegExp("[A-Z]{2}([A-Z0-9]){9}[0-9]");
      const messageSplit: string[] = context.activity.text.split(" ");
      const isIsin = regexp.test(context.activity.text);

      const regexpContainsNumber = new RegExp("[0-9]");
      const containsNumber = regexpContainsNumber.test(context.activity.text);

      let prefixes = new Map([
        ["k", Math.pow(10, 3)],
        ["m", Math.pow(10, 6)],
        ["M", Math.pow(10, 9)],
      ]);

      if (containsNumber) {
        const numb = messageSplit.find((i) => regexpContainsNumber.test(i));
        const isLastCharLetter = new RegExp("[A-Za-z]$");

        if (numb) {
          if (isLastCharLetter.test(numb)) {
            const prefix = prefixes.get(numb[numb.length - 1]);
            if (prefix) {
              let price = Number(prefix) * Number(numb.slice(0, -1));
              await context.sendActivity({ text: String(price) });
            }
          } else {
            await context.sendActivity({ text: String(numb) });
          }
        } else {
          console.error(numb);
        }
      }

      if (isIsin) {
        const isin = messageSplit.find((i) => regexp.test(i));
        const textMessage = await this.getDocumentByISIN(isin);

        await context.sendActivity({
          text: textMessage,
          attachments: [CardFactory.adaptiveCard(this.isinCard)],
        });
        this.history.push(context.activity.text);
        await next();
      } else {
        await context.sendActivity({ text: "Enter a ISIN number" });
        this.history.push(context.activity.text);
        await next();
      }
    });

    // Adaptive cards event handler
    this.adaptiveCard.onExecuteAction = function (action) {
      console.log("action: ", action);
    };
  }

  async getDocumentByISIN(_isin: string | undefined) {
    if (_isin === undefined) return "No isin found";

    console.log("_isin: ", _isin);
    const result = await this.dbClient.getDocumentByISIN(_isin);

    this.isinCard.body[0].text = result.Instrument;
    this.isinCard.body[1].text = "ISIN: " + result.ISIN;
    this.isinCard.body[2].text = "ACT: " + result.AccruedDayCountConvention;
    this.isinCard.body[3].text = "Term date: " + result.TermDate;

    const textMessage: string = "Here is the information about: " + result.ISIN;

    return textMessage;
  }
}
