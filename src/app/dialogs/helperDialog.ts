import { InputHints } from 'botbuilder';
import { ComponentDialog, DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';

export class HelperDialog extends ComponentDialog {
    private connectionName: string;
    
    constructor(id: string, connectionName: string) {
        super(id);
        this.connectionName = connectionName;
    }

    public async onContinueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const result = await this.interruption(dc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(dc);
    }

    private async interruption(dc: DialogContext): Promise<DialogTurnResult|undefined> {
        if (dc.context.activity.text) {
            const text = dc.context.activity.text.toLowerCase();

            switch (text) {
                case 'help':
                case '?':
                    const helpMessageText = 'Answer the questions asked. If you want to restart use: cancel, quit or restart';
                    await dc.context.sendActivity(helpMessageText, helpMessageText, InputHints.ExpectingInput);
                    return { status: DialogTurnStatus.waiting };
                case 'cancel':
                case 'quit':
                case 'restart':
                    const cancelMessageText = 'Restarting...';
                    await dc.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
                    return await dc.cancelAllDialogs();
                case 'logout':
                    const adapter: any = dc.context.adapter;
                    await adapter.signOutUser(dc.context, this.connectionName);
                    dc.context.sendActivity('You have been signed out');
                    return await dc.cancelAllDialogs();
            }
        }
    }
}
