import { AdaptiveCard, TextBlock } from "adaptivecards";

export class ISINCard extends AdaptiveCard {
  instrument: TextBlock;
  isin: TextBlock;
  act: TextBlock;
  termDate: TextBlock;

  constructor() {
    super();

    this.instrument = new TextBlock();
    this.instrument.id = "_instrument";

    this.isin = new TextBlock();
    this.isin.id = "_isin";

    this.act = new TextBlock();
    this.act.id = "_act";

    this.termDate = new TextBlock();
    this.termDate.id = "_termDate";


    const textBlocks: TextBlock[] = [
      this.instrument,
      this.isin,
      this.act,
      this.termDate
    ];

    textBlocks.forEach((block) => this.addItem(block));
  }
}