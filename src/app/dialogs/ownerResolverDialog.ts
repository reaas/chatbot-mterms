import {
  OAuthPrompt,
  PromptValidatorContext,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
  ComponentDialog,
  DialogContext,
  DialogTurnResult,
  DialogTurnStatus 
} from 'botbuilder-dialogs';
import { GraphHelper } from '../helpers/graphHelper';

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const OAUTH_PROMPT = 'OAuthPrompt'

export class OwnerResolverDialog extends ComponentDialog {
  private static tokenResponse: any;

  private static async ownerPromptValidator(promptContext: PromptValidatorContext<string>): Promise<boolean> {
    if (promptContext.recognized.succeeded) {
      
      const owner: string = promptContext.recognized.value!;
      if (!await GraphHelper.userExists(OwnerResolverDialog.tokenResponse, owner)) {
        await promptContext.context.sendActivity('User does not exist.');
        return false;
      }

      return true;

    } else {
      return false;
    }
  }

  constructor(id: string) {
    super(id || 'GraphConnection');
    this
        .addDialog(new TextPrompt(TEXT_PROMPT, OwnerResolverDialog.ownerPromptValidator.bind(this)))
        .addDialog(new OAuthPrompt(OAUTH_PROMPT, {
          connectionName: 'GraphConnection',
          text: 'Please Sign In',
          timeout: 300000,
          title: 'Sign In'
        }))
        .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
          this.promptStep.bind(this),
          this.initialStep.bind(this),
          this.finalStep.bind(this)
        ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

 private async promptStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
      return await stepContext.beginDialog(OAUTH_PROMPT);
  }

  private async initialStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    const tokenResponse = stepContext.result;
    if (tokenResponse && tokenResponse.token) {
      OwnerResolverDialog.tokenResponse = tokenResponse;

      const siteDetails = (stepContext.options as any).siteDetails;
      const promptMsg = 'Provide an owner email';
      if (!siteDetails.owner) {
        return await stepContext.prompt(TEXT_PROMPT, {
          prompt: promptMsg
        });
      } else {
        return await stepContext.next(siteDetails.owner);
      }
    }
    await stepContext.context.sendActivity('Login was not successful please try again.');
    return await stepContext.endDialog();
  }

  private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {    
    const owner = stepContext.result;
    return await stepContext.endDialog(owner);
  }
}
