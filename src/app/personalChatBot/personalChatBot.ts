import { CardFactory, TeamsActivityHandler } from "botbuilder";
import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import { AdaptiveCard, CardElement, TextInput } from "adaptivecards";
const log = debug("msteams");

export class PersonalChatBot extends TeamsActivityHandler {
  history: String[] = [];

  dbClient = new DBClient();
  adaptiveCard = new AdaptiveCards.AdaptiveCard();

  isinCard = require("../cards/isin.json");

  constructor() {
    super();

    const form = this.createFrom();
    this.onMessage(async (context, next) => {
      await this.dbClient.connect();

      if (context.activity.value) {
        console.log('value: ', context.activity.value);
      } else {
        const regexp = new RegExp('[A-Z]{2}([A-Z0-9]){9}[0-9]');
        const messageSplit: string[] = context.activity.text.split(" ");
        const isIsin = regexp.test(context.activity.text);
  
        if (context.activity.text.toLowerCase() === 'form') {
          await context.sendActivity({attachments: [CardFactory.adaptiveCard(form.toJSON())]});
          await next();
        } else if (isIsin) {
          const isin = messageSplit.find((i) => regexp.test(i));
          const textMessage = await this.getDocumentByISIN(isin);
          
          await context.sendActivity({ text: textMessage, attachments: [CardFactory.adaptiveCard(this.isinCard)] });
          this.history.push(context.activity.text);
          await next();
        } else {
          await context.sendActivity({ text: "Enter a ISIN number" });
          this.history.push(context.activity.text);
          await next()
        }
      }
    });

    form.onExecuteAction = function(action) {
      console.log('ACTION: ', action);
    }

    // Adaptive cards event handler
    this.adaptiveCard.onExecuteAction = function(action) {
      console.log('action: ', action);
    }
  }

  createFrom(): AdaptiveCards.AdaptiveCard {
    const formCard: AdaptiveCards.AdaptiveCard = new AdaptiveCards.AdaptiveCard();

    const cardHeader: AdaptiveCards.TextBlock = new AdaptiveCards.TextBlock("Form");
    cardHeader.size = AdaptiveCards.TextSize.Large;

    const cardSubHeader: AdaptiveCards.TextBlock = new AdaptiveCards.TextBlock("Please give me more information by filling out this form");

    // Input fields
    const _isin: TextInput = new TextInput();
    _isin.id = "_isin";
    _isin.placeholder = "ISIN";

    const _issuer: TextInput = new TextInput();
    _issuer.id = "_issuer";
    _issuer.placeholder = "Utsender";

    const _issueDate: TextInput = new TextInput();
    _issueDate.id = "_issueDate";
    _issueDate.placeholder = "Utsendelsesdato";

    const _maturityDate: TextInput = new TextInput();
    _maturityDate.id = "_maturityDate";
    _maturityDate.placeholder = "Modningdato";

    const _rate: TextInput = new TextInput();
    _rate.id = "_rate";
    _rate.placeholder = "Sats";

    const _manager: TextInput = new TextInput();
    _manager.id = "_manager";
    _manager.placeholder = "Manager";

    // Form actions
    const action: AdaptiveCards.Action = new AdaptiveCards.SubmitAction();
    action.title = "Send";

    formCard.addItem(cardHeader);
    formCard.addItem(cardSubHeader);
    
    formCard.addItem(_isin);
    formCard.addItem(_issuer);
    formCard.addItem(_issueDate);
    formCard.addItem(_maturityDate);
    formCard.addItem(_rate);
    formCard.addItem(_manager);

    formCard.addAction(action);

    return formCard;
  }

  async getDocumentByISIN(_isin: string | undefined) {
    if (_isin === undefined) return "No isin found";
    
    console.log('_isin: ', _isin);
    const result = await this.dbClient.getDocumentByISIN(_isin);

    console.log(result);

    this.isinCard.body[0].text = result.Instrument;
    this.isinCard.body[1].text = "ISIN: " + result.ISIN;
    this.isinCard.body[2].text = "ACT: " + result.AccruedDayCountConvention;
    this.isinCard.body[3].text = "Term date: " + result.TermDate;

    const textMessage: string = "Here is the information about: " + result.ISIN;

    return textMessage;
  }
}