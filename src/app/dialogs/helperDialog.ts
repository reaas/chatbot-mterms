import { InputHints } from 'botbuilder';
import { ComponentDialog, DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';

export class HelperDialog extends ComponentDialog {
    private connectionName: string;
    
    constructor(id: string, connectionName: string) {
        super(id);
        this.connectionName = connectionName;
    }
}
