import { CardFactory, TeamsActivityHandler } from "botbuilder";
import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import { BuyForm } from "../forms/buyForm";
import { ISINCard } from "../cards/isinCard";
const log = debug("msteams");

export class PersonalChatBot extends TeamsActivityHandler {
  history: String[] = [];

  dbClient = new DBClient();
  adaptiveCard = new AdaptiveCards.AdaptiveCard();

  isinCard: ISINCard = new ISINCard();

  buyForm: BuyForm = new BuyForm("Buy form", "Heiheihå");

  prefixes = new Map([
    ["k", Math.pow(10, 3)],
    ["m", Math.pow(10, 6)],
    ["M", Math.pow(10, 9)], 
    ["b", Math.pow(10, 12)], 
    ["thousand", Math.pow(10, 3)],
    ["million", Math.pow(10, 6)],
    ["mill", Math.pow(10, 6)],
    ["millions", Math.pow(10, 6)],
    ["billion", Math.pow(10, 9)],
    ["billions", Math.pow(10, 9)],
    ["trillion", Math.pow(10, 12)],
    ["trillions", Math.pow(10, 12)],
  ]);

  constructor() {
    super();

    this.onMessage(async (context, next) => {
      await this.dbClient.connect();

      if (context.activity.value) {
        console.log('value: ', context.activity.value);
      } else {
        const isinRegExp = new RegExp('[A-Z]{2}([A-Z0-9]){9}[0-9]');
        const messageSplit: string[] = context.activity.text.split(" ");
        const isIsin = isinRegExp.test(context.activity.text);

        const regexpContainsNumber = new RegExp('[0-9]');
        const containsNumber = regexpContainsNumber.test(context.activity.text);

        //Converts numbers with prefix to normal numbers
        if (containsNumber) {
          const numb = messageSplit.find((i) => regexpContainsNumber.test(i));
          const isLastCharLetter = new RegExp("[A-Za-z]$");
          const isLast4CharLetters = new RegExp("[A-Za-z]{4}");
          const isLast7CharLetters = new RegExp("[A-Za-z]{7}");
          const isLast8CharLetters = new RegExp("[A-Za-z]{8}");
          const isLast9CharLetters = new RegExp("[A-Za-z]{9}");
  
          if (numb) {
            let numberOfLettersInNumb = -1
            if (isLast9CharLetters.test(numb)) {
              numberOfLettersInNumb = -9;
            } 
            else if (isLast8CharLetters.test(numb)) {
              numberOfLettersInNumb = -8;
            }
            else if (isLast7CharLetters.test(numb)) {
              numberOfLettersInNumb = -7;
            }
            else if (isLast4CharLetters.test(numb)) {
              numberOfLettersInNumb = -4;
            }
            else if (isLastCharLetter.test(numb)) {
              numberOfLettersInNumb = -1;
            }
            const prefix = this.prefixes.get(numb.slice(numberOfLettersInNumb, numb.length).toLowerCase());
            if (prefix) {
              let price = Number(prefix) * Number(numb.slice(0, numberOfLettersInNumb));
              await context.sendActivity({ text: String(price) });
            }
          } else {
            console.error(numb);
          }
        } else if (context.activity.text.toLowerCase() === 'form') {
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(this.buyForm.toJSON())] });
          await next();
        } else if (isIsin) {
          const isin = messageSplit.find((i) => isinRegExp.test(i));
          const textMessage = await this.getDocumentByISIN(isin);
          
          await context.sendActivity({ text: textMessage, attachments: [CardFactory.adaptiveCard(this.isinCard.toJSON())] });
          this.history.push(context.activity.text);
          await next();
        } else {
          await context.sendActivity({ text: "Enter a ISIN number" });
          this.history.push(context.activity.text);
          await next()
        }
      }
    });
  }

  async getDocumentByISIN(_isin: string | undefined) {
    if (_isin === undefined) return "No isin found";
    
    const result = await this.dbClient.getDocumentByISIN(_isin);

    this.isinCard.instrument.text = result.Instrument;
    this.isinCard.isin.text = "ISIN; " + result.ISIN;
    this.isinCard.act.text = "ACT: " + result.AccruedDayCountConvention;
    this.isinCard.termDate.text = "Term date: " + result.TermDate;

    const textMessage: string = "Here is the information about: " + result.ISIN;

    return textMessage;
  }
}