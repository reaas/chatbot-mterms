import { AdaptiveCard, TextBlock, TextSize } from "adaptivecards";
import { Attachment } from "botbuilder";

export abstract class Form extends AdaptiveCard {
    header: TextBlock;
    subheader: TextBlock;

    constructor(header: string, subheader: string) {
        super();

        this.header = new TextBlock(header);
        this.header.size = TextSize.Large;
        this.subheader = new TextBlock(subheader);
    }

    abstract async setDropdowns(): Promise<void>;

    abstract async fillForm(): Promise<Attachment>;
}