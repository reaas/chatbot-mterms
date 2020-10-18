import { AdaptiveCard, TextBlock } from "adaptivecards";

export class ISINCard extends AdaptiveCard {
  instrument: TextBlock;
  isin: TextBlock;
  issueDate: TextBlock;
  maturityDate: TextBlock;
  rateDetails: TextBlock;
  type: TextBlock;
  figi: TextBlock;

  constructor() {
    super();

    this.instrument = new TextBlock();
    this.instrument.id = "_instrument";

    this.isin = new TextBlock();
    this.isin.id = "_isin";

    this.issueDate = new TextBlock();
    this.issueDate.id = "_issueDate";

    this.maturityDate = new TextBlock();
    this.maturityDate.id = "_maturityDate";

    this.rateDetails = new TextBlock();
    this.rateDetails.id = "_rateDetails";

    this.type = new TextBlock();
    this.type.id = "_type";

    this.figi = new TextBlock();
    this.figi.id = "_figi";

    const textBlocks: TextBlock[] = [
      this.instrument,
      this.isin,
      this.issueDate,
      this.maturityDate,
      this.rateDetails,
      this.type,
      this.figi
    ];

    textBlocks.forEach((block) => this.addItem(block));
  }
}