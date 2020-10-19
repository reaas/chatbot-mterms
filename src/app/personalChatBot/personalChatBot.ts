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
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
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
        text: `Welcome to Simon Bot ${mention.text}. This Bot is a work in progress. At this time we have some dialogs working. Type anything to get started.`,
        type: ActivityTypes.Message
    };

    await context.sendActivity(message);
  }

}
