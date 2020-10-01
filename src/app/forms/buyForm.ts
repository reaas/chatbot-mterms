import { Action, AdaptiveCard, SubmitAction, TextBlock, TextInput, TextSize } from "adaptivecards";

export class BuyForm extends AdaptiveCard {
  header: TextBlock;
  subHeader: TextBlock;

  textInputs: TextInput[];
  actions: Action[];

  constructor(header: string, subHeader: string) {
    super();

    this.header = new TextBlock(header);
    this.header.size = TextSize.Large;

    this.subHeader = new TextBlock(subHeader);

    // Inputs
    const _isin: TextInput = new TextInput();
    _isin.id = "_isin";
    _isin.placeholder = "ISIN";

    const _issuer: TextInput = new TextInput();
    _issuer.id = "_issuer";
    _issuer.placeholder = "Utsender";

    const _issueDate: TextInput = new TextInput();
    _issueDate.id = "_issueDate";
    _issueDate.placeholder = "Utsendelsesdato";

    const _maturityDate: TextInput = new TextInput();
    _maturityDate.id = "_maturityDate";
    _maturityDate.placeholder = "Modningdato";

    const _rate: TextInput = new TextInput();
    _rate.id = "_rate";
    _rate.placeholder = "Sats";

    const _manager: TextInput = new TextInput();
    _manager.id = "_manager";
    _manager.placeholder = "Manager";

    this.textInputs = [
      _isin, _issuer, _issueDate, _maturityDate, _rate, _manager
    ];


    // Actions
    const submit: Action = new SubmitAction();
    submit.title = "Send";

    this.actions = [submit];


    // Adding everything to card
    this.addItem(this.header);
    this.addItem(this.subHeader);
    this.textInputs.forEach((input) => this.addItem(input));
    this.actions.forEach((action) => this.addAction(action));
  }
}