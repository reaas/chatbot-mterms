import {
  Activity,
  ActivityTypes,
  BotState,
  ChannelAccount,
  ConversationState,
  Mention,
  SigninStateVerificationQuery,
  StatePropertyAccessor,
  TeamsActivityHandler,
  TurnContext,
  UserState,
  Attachment,
  CardFactory
} from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';
import { MainDialog } from '../dialogs/mainDialog';

import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import { BuyForm } from "../forms/buyForm";
import { ISINCard } from "../cards/isinCard";
import { InternalAPI } from "../internalAPI/internalAPI";
import * as moment from 'moment';
const log = debug("msteams");

interface History {
  type: string;
  value: any;
  formType?: string;
}

export class PersonalChatBot extends TeamsActivityHandler {
  private conversationState: BotState;
  private userState: BotState;
  private dialog: Dialog;
  private dialogState: StatePropertyAccessor<DialogState>;

  history: History[] = [];

  inDialog = false;

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


  constructor(conversationState: BotState, userState: BotState, dialog: Dialog) {
    super();
    this.conversationState = conversationState as ConversationState;
    this.userState = userState as UserState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty<DialogState>('DialogState');


    this.onMessage(async (context, next) => {
      if (context.activity.value) {
        console.log('value: ', context.activity.value);
      } else {
        const messageSplit: string[] = context.activity.text.split(" ");
        if (context.activity.text.toUpperCase() == 'Create task'.toUpperCase()) {
            this.inDialog = true;
            await (this.dialog as MainDialog).run(context, this.dialogState);
            await next();
            return;
        } else if (this.inDialog == true && !(context.activity.text.toUpperCase() == 'Stop'.toUpperCase())) { 
            console.log("In dialog")
            await (this.dialog as MainDialog).run(context, this.dialogState);
            await next();
            return;
        }
 
        let answer: History[] = [];
        let isinMaybe: string = "";

        messageSplit.forEach(async (message, index) => {
          if (this.isISIN(message)) {
            isinMaybe = message;
          }

          if (message.toLowerCase() === 'price') {
            const isinToFind = this.history.find((ele) => ele.type === 'ISIN');

            if (isinToFind) {
              await this.internalAPI.getLatestPriceById(isinToFind.value).then(async (price) => {
                console.log('price: ', price)
                this.history.push({ type: "PRICE", value: "The last price of " + isinToFind.value + " was " + price.value + "\r\n" });
                answer.push({ type: "PRICE", value: "The last price of " + isinToFind.value + " was " + price.value + "\r\n" });
  
                await context.sendActivity({ text: "The last price of " + isinToFind.value + " was " + price.value + "\r\n" });
              }).catch((error) => console.error('error when doing price: ', error));
            }
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
                this.history.push({ type: "PRICE", value: "Price parsed: " + String(price) + "\n\r" });
                answer.push({ type: "PRICE", value: "Price parsed: " + String(price) + "\n\r" });
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
                + '3. an ISIN number - returns the internal data of that ISIN \r\n'
                + '4. price in different formats - returns the price as en integer, e.g. 90k will return 90000 \r\n'
                + '5. "Create task" - Starts a dialog which creates a new task. Type "Stop" to stop. \r\n'
            });
          }
          if (message.toLowerCase() == 'stop' && this.inDialog) {
            this.inDialog = false;
            answer.push({
              type: 'STOP',
              value: 'Create task stopped.\r\n'
            });
          }
        });

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
                const isinInput = this.buyForm.textInputs.find(i => i.id === '_isin');
  
                if (isinInput) {
                  isinInput.defaultValue = isinMaybe;
                }
  
                isForm.value = CardFactory.adaptiveCard(this.buyForm.toJSON()); 
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
            case 'STOP':
              textMessage += toSend.value + "\r\n";
              break;
          }
        });

        await context.sendActivity({ text: textMessage, attachments: attachments });
      }
    });

    this.onDialog(async (context, next) => {
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);

        // By calling next() you ensure that the next BotHandler is run.
        await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded!;
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          // If we are in Microsoft Teams
          if (context.activity.channelId === 'msteams') {
            // Send a message with an @Mention
            await this._messageWithMention(context, member);
          } else {
            // Otherwise we send a normal echo
            await context.sendActivity(`Welcome!`);
          }
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });


    this.onTokenResponseEvent(async (context, next) => {
      console.log('Running dialog with Token Response Event Activity.');

      // Run the Dialog with the new Token Response Event Activity.
      await (this.dialog as MainDialog).run(context, this.dialogState);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
  });

  }

  private isISIN(message: string): boolean {
    return new RegExp('[A-Z]{2}([A-Z0-9]){9}[0-9]').test(message);
  }

  private containsNumber(message: string): boolean {
    return new RegExp('[0-9]').test(message);
  }

  private isFormMessage(message: string): boolean {
    return new RegExp('^(.*form).*').test(message);
  }

  public async run(context): Promise<void> {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
  
  public async handleTeamsSigninVerifyState(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
    await (this.dialog as MainDialog).run(context, this.dialogState);
  }

  private async _messageWithMention(context: TurnContext, member: ChannelAccount): Promise<void> {
    // Create mention object
    const mention: Mention = {
        mentioned: member,
        text: `<at>${member.name}</at>`,
        type: 'mention'
    };

    // Construct message to send
    const message: Partial<Activity> = {
        entities: [mention],
        text: `This Bot is a work in progress. At this time we have some dialogs working. Type anything to get started.`,
        type: ActivityTypes.Message
    };

    await context.sendActivity(message);
  }
}
