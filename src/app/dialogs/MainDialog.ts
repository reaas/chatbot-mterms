import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    OAuthPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';

import { SiteDetails } from './siteDetails';
import { SimpleGraphClient } from '../helpers/simpleGraphClient'
import { token } from 'morgan';

const MAIN_DIALOG = 'waterfallDialog';
const OAUTH_PROMPT = 'OAuthPrompt';

export class MainDialog extends ComponentDialog {
    private static schemaValues: any;
    
    constructor(id: string) {
        super(id);
        this.addDialog(new WaterfallDialog(MAIN_DIALOG, [
                this.promptStep.bind(this),
                this.initialStep.bind(this),
                this.finalStep.bind(this)
            ]))
            .addDialog(new OAuthPrompt(OAUTH_PROMPT, {
                connectionName: 'GraphConnection',
                text: 'Please Sign In',
                timeout: 100,
                title: 'Sign In'
            }));
        this.initialDialogId = MAIN_DIALOG;
    }

    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>, schemaValues: string) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        MainDialog.schemaValues = schemaValues;

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    private async promptStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        return await stepContext.beginDialog(OAUTH_PROMPT);
    }

    private async initialStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const tokenResponse = stepContext.result;

        if (tokenResponse) {
            await stepContext.context.sendActivity('You are logged in.');
            await MainDialog.createTask(tokenResponse, MainDialog.schemaValues)
            const siteDetails = new SiteDetails();
            if (stepContext.result === true) {
                const siteDetails = stepContext.options as SiteDetails;
                return await stepContext.endDialog(siteDetails);
            } else {
                return await stepContext.endDialog();
            }
           //return await stepContext.beginDialog(SITE_DIALOG, siteDetails);
        }
        await stepContext.context.sendActivity('Login was not successful please try again.');
        return await stepContext.endDialog();  
    }

    public static async createTask(tokenResponse: any, schemaValues: string): Promise<void> {
        if (!tokenResponse) {
            throw new Error('GraphHelper.createTask(): `tokenResponse` cannot be undefined.')
        }
        const client = new SimpleGraphClient(tokenResponse.token);
        await client.createTask(schemaValues)
    }

    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        if (stepContext.result) {
            const result = stepContext.result as SiteDetails;
            const msg = `I have created a ${ JSON.stringify(result) }`;
            await stepContext.context.sendActivity(msg);
        }
        return await stepContext.endDialog();
    }
}
