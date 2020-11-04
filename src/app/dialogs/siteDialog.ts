import {
    ChoiceFactory,
    ChoicePrompt,
    ConfirmPrompt,
    DialogTurnResult,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext,
    ComponentDialog
} from 'botbuilder-dialogs';

import {AliasResolverDialog} from './aliasResolverDialog';
import { OwnerResolverDialog } from './ownerResolverDialog';
import { SiteDetails } from './siteDetails';

const ALIAS_RESOLVER_DIALOG = 'aliasResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const OWNER_RESOLVER_DIALOG = 'ownerResolverDialog';
const CONFIRM_PROMPT = 'confirmPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

export class SiteDialog extends ComponentDialog {
    constructor(id: string) {
        super(id || 'GraphConnection');
        this
            .addDialog(new AliasResolverDialog(ALIAS_RESOLVER_DIALOG))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new OwnerResolverDialog(OWNER_RESOLVER_DIALOG))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.finalStep.bind(this)
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }    

    /**
     * If a site type has not been provided, prompt for one.
     */
    private async siteTypeStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;
        if (!siteDetails.siteType) {
            return await stepContext.prompt(CHOICE_PROMPT, {
                choices: ChoiceFactory.toChoices(['Team Site', 'Communication Site']),
                prompt: 'Select site type.'
            });
        } else {
            return await stepContext.next(siteDetails.siteType);
        }
    }
    
    /**
     * Complete the interaction and end the dialog.
     */
    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        if (stepContext.result === true) {
            const siteDetails = stepContext.options as SiteDetails;
            return await stepContext.endDialog(siteDetails);
        } else {
            return await stepContext.endDialog();
        }
    }

}
