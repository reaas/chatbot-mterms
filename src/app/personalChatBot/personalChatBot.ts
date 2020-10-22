/*
import {
  Activity,
  ActivityTypes,
  BotState,
	CardFactory,
  ChannelAccount,
  ConversationState,
  Mention,
  SigninStateVerificationQuery,
  StatePropertyAccessor,
  TeamsActivityHandler,
  TurnContext,
  UserState
} from 'botbuilder';
import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import { BuyForm } from "../forms/buyForm";
import { ISINCard } from "../cards/isinCard";
import { Dialog, DialogState } from 'botbuilder-dialogs';
import { MainDialog } from '../dialogs/mainDialog';

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
*/

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
  UserState
} from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';
import { MainDialog } from '../dialogs/mainDialog';

export class PersonalChatBot extends TeamsActivityHandler {
  private conversationState: BotState;
  private userState: BotState;
  private dialog: Dialog;
  private dialogState: StatePropertyAccessor<DialogState>;
  /**
   *
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */
  constructor(
    conversationState: BotState,
    userState: BotState,
    dialog: Dialog
  ) {
    super();
    if (!conversationState) {
        throw new Error('[SimonBot]: Missing parameter. conversationState is required');
    }
    if (!userState) {
        throw new Error('[SimonBot]: Missing parameter. userState is required');
    }
    if (!dialog) {
        throw new Error('[SimonBot]: Missing parameter. dialog is required');
    }
    this.conversationState = conversationState as ConversationState;
    this.userState = userState as UserState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty<DialogState>('DialogState');

    this.onMessage(async (context, next) => {
      
      // Run the Dialog with the new message Activity.
      await (this.dialog as MainDialog).run(context, this.dialogState);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
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
            await context.sendActivity(`Welcome to Simon Bot ${member.name}. This Bot is a work in progress. At this time we have some dialogs working. Type anything to get started.`);
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

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
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

