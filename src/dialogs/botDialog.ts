import { Dialog, DialogContext, DialogTurnResult } from "botbuilder-dialogs";


export class BotDialog extends Dialog {

    
    beginDialog(dc: DialogContext, options?: {}): Promise<DialogTurnResult<any>> {
        throw new Error("Method not implemented.");
    }
    
}