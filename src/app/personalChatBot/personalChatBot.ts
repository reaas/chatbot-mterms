import { Attachment, CardFactory, TeamsActivityHandler } from "botbuilder";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import { BuyForm } from "../forms/buyForm";
import { ISINCard } from "../cards/isinCard";
import { InternalAPI } from "../internalAPI/internalAPI";
import * as moment from 'moment';
import { Choice } from "adaptivecards";

interface History {
  type: string;
  value: any;
  formType?: string;
}

export class PersonalChatBot extends TeamsActivityHandler {
  history: History[] = [];

  dbClient = new DBClient();
  internalAPI = new InternalAPI();
  adaptiveCard = new AdaptiveCards.AdaptiveCard();

  isinCard: ISINCard = new ISINCard();

  buyForm: BuyForm = new BuyForm("Buy form", "Please fill out this form");

  //***** Price constants *****//
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

  isLastCharLetter = new RegExp("[A-Za-z]$");
  isLast4CharLetters = new RegExp("[A-Za-z]{4}");
  isLast7CharLetters = new RegExp("[A-Za-z]{7}");
  isLast8CharLetters = new RegExp("[A-Za-z]{8}");
  isLast9CharLetters = new RegExp("[A-Za-z]{9}");

  //***************************//

  constructor() {
    super();

    this.onMessage(async (context, next) => {
      if (context.activity.value) {
        console.log('value: ', context.activity.value);
      } else {
        const messageSplit: string[] = context.activity.text.split(" ");

        let answer: History[] = [];

        let isinMaybe: string = "";
        let isinToFind: History = { type: "", value: ""};

        messageSplit.forEach(async (message, index) => {
          if (this.isISIN(message)) {
            isinMaybe = message;
            this.history.push({ type: 'ISIN', value: isinMaybe });
          }

          if (message.toLowerCase() === 'price') {
            const temp = this.history.find((ele) => ele.type === 'ISIN');
            if (temp) isinToFind = temp;
          }
          
          if (this.containsNumber(message)) {
            if (message) {
              let numberOfLettersInNumb = -1
              if (this.isLast9CharLetters.test(message)) {
                numberOfLettersInNumb = -9;
              } 
              else if (this.isLast8CharLetters.test(message)) {
                numberOfLettersInNumb = -8;
              }
              else if (this.isLast7CharLetters.test(message)) {
                numberOfLettersInNumb = -7;
              }
              else if (this.isLast4CharLetters.test(message)) {
                numberOfLettersInNumb = -4;
              }
              else if (this.isLastCharLetter.test(message)) {
                numberOfLettersInNumb = -1;
              }

              const prefix = this.prefixes.get(message.slice(numberOfLettersInNumb, message.length).toLowerCase());
              if (prefix) {
                let price = Number(prefix) * Number(message.slice(0, numberOfLettersInNumb));

                const his: History = { type: "PRICE", value: `Price parsed: ${String(price)}\n\r` }
                this.history.push(his);
                answer.push(his);
              }
            } else {
              console.error("Error parsing " + message + " to a number");
            }
          }

          if (this.isFormMessage(message)) {
            let formType: string = message.toLowerCase();
            if (message.toLowerCase() === 'form') {
              formType = messageSplit[index - 1].toLowerCase() + message.toLowerCase();
            }

            const historyForm: History = {
              type: 'FORM',
              value: '',
              formType: formType
            };

            switch (formType) {
              case 'buyform':
                historyForm.value = CardFactory.adaptiveCard(this.buyForm.toJSON());
                break;
            }

            this.history.push(historyForm);
            answer.push(historyForm);
          }

          if (message.toLowerCase() === 'help') {
            answer.push({
              type: 'HELP',
              value: 'This bot can do a number of operations. Review the following: \r\n\r\n'
                + '1. help - returns this message \r\n'
                + '2. buyform/buy form - returns a buy form \r\n'
                + '3. an ISIN number - returns the internal data of that ISIN'
                + '4. price in different formats - returns the price as en integer, e.g. 90k will return 90000'
            });
          }
        });

        if (isinToFind.type === 'ISIN') {
          console.log('isintofind: ', isinToFind)
          await this.internalAPI.getLatestPriceById(isinToFind.value).then(async (price) => {
            const his: History = { type: 'PRICE', value: `The last price of ${isinToFind.value} was ${price.value}\r\n` };

            this.history.push(his);
            answer.push(his);
          }).catch((error) => console.error('Error when doing price: ', error));
        }

        if (isinMaybe.length > 0) {
          await this.internalAPI.getInstrumentById(isinMaybe).then(async (isininfo) => {
            this.isinCard.instrument.text = isininfo.name;
            this.isinCard.isin.text = "ISIN; " + isininfo.isin;
            this.isinCard.issueDate.text = "Issue data; " + moment(isininfo.issueDate).format('DD.MM.YYYY');
            this.isinCard.maturityDate.text = "Maturity date: " + moment(isininfo.maturityDate).format('DD.MM.YYYY');
            this.isinCard.rateDetails.text = "Rate details: " + isininfo.rateDetails;
            this.isinCard.type.text = "Type: " + isininfo.type;
            this.isinCard.figi.text = isininfo.figi ? "Figi: " + isininfo.figi : "No FIGI";

            this.history.push({ type: "ISIN", value: this.isinCard.toJSON() });

            const isForm = answer.find(a => a.type === "FORM")
            
            if (isForm) {
              if (isForm.formType === 'buyform') {
                isForm.value = await this.fillBuyForm(isininfo);
              }
            }

            await context.sendActivity({ text: "Here is more information about: " + isinMaybe, attachments: [CardFactory.adaptiveCard(this.isinCard.toJSON())] });
          });
        }

        let textMessage: string = "";
        const attachments: Attachment[] = [];

        answer.forEach((toSend) => {
          switch (toSend.type) {
            case 'ISIN':
              attachments.push(toSend.value);
              break;
            case 'PRICE':
              textMessage += toSend.value;
              break;
            case 'FORM':
              attachments.push(toSend.value);
              break;
            case 'HELP':
              textMessage += toSend.value + "\r\n";
              break;
          }
        });

        await context.sendActivity({ text: textMessage, attachments: attachments });
        await next();
      }
    });
  }

  public isISIN(message: string): boolean {
    return new RegExp('[A-Z]{2}([A-Z0-9]){9}[0-9]').test(message);
  }

  public containsNumber(message: string): boolean {
    return new RegExp('[0-9]').test(message);
  }

  public isFormMessage(message: string): boolean {
    return new RegExp('^(.*form).*').test(message);
  }

  fillBuyForm = (isininfo: Instrument) => new Promise<Attachment>(async (resolve) => {
    const isinInput = this.buyForm.textInputs.find(i => i.id === '_isin');
    const issuerInput = this.buyForm.textInputs.find(i => i.id === '_issuer');
    const issueDateInput = this.buyForm.textInputs.find(i => i.id === '_issueDate');
    const maturityDateInput = this.buyForm.textInputs.find(i => i.id === '_maturityDate');
    const rateInput = this.buyForm.textInputs.find(i => i.id === '_rate');
    const managerInput = this.buyForm.textInputs.find(i => i.id === '_manager');
    const issuerTypeInput = this.buyForm._issuerType;

    if (isinInput) isinInput.defaultValue = isininfo.isin;
    if (issuerInput) issuerInput.defaultValue = isininfo.name;
    if (issueDateInput) issueDateInput.defaultValue = moment(isininfo.issueDate).format('DD.MM.YYYY');
    if (maturityDateInput) maturityDateInput.defaultValue = moment(isininfo.maturityDate).format('DD.MM.YYYY');
    if (rateInput) rateInput.defaultValue = isininfo.rateDetails;

    const issuerTypes = await this.internalAPI.getIssuerTypes();
    if (issuerTypeInput) issuerTypeInput.choices = issuerTypes.map(it => new Choice(it.Value, it.Key));

    resolve(CardFactory.adaptiveCard(this.buyForm.toJSON()));
  });
}