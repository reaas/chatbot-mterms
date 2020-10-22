import { Action, AdaptiveCard, SubmitAction, TextBlock, TextInput, TextSize, ToggleInput } from "adaptivecards";
import { ConfirmInput } from "botbuilder-dialogs-adaptive";

export class BuyForm extends AdaptiveCard {
  header: TextBlock;
  subHeader: TextBlock;

  textInputs: TextInput[];
  stressInputs: TextInput[];
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
    _issuer.placeholder = "Issuer";

    const _issueDate: TextInput = new TextInput();
    _issueDate.id = "_issueDate";
    _issueDate.placeholder = "Issue date";

    const _maturityDate: TextInput = new TextInput();
    _maturityDate.id = "_maturityDate";
    _maturityDate.placeholder = "Maturity date";

    const _rate: TextInput = new TextInput();
    _rate.id = "_rate";
    _rate.placeholder = "Rate";

    const _manager: TextInput = new TextInput();
    _manager.id = "_manager";
    _manager.placeholder = "Manager";

    const _amount: TextInput = new TextInput();
    _amount.id = "_input";
    _amount.placeholder = "Amount";

    const _percentagePrice: TextInput = new TextInput();
    _percentagePrice.id = "_percentagePrice";
    _percentagePrice.placeholder = "Percentage price";

    const _issuerType: TextInput = new TextInput();
    _issuerType.id = "_issuerType";
    _issuerType.placeholder = "Issuer type";

    const _creditCurve: TextInput = new TextInput();
    _creditCurve.id = "_creditCurve";
    _creditCurve.placeholder = "Credit curve";

    const _yieldCurve: TextInput = new TextInput();
    _yieldCurve.id = "_yieldCurve";
    _yieldCurve.placeholder = "Yield curve";

    const _bbgid: TextInput = new TextInput();
    _bbgid.id = "_bbgid";
    _bbgid.placeholder = "BBGID";

    // Stress inputs
    const _stressIncludeInStress: ToggleInput = new ToggleInput();
    _stressIncludeInStress.id = "_stressIncludeInStress";
    _stressIncludeInStress.title = "Include in stress";

    const _stressInterestRate: TextInput = new TextInput();
    _stressInterestRate.id = "_stressInterestRate";
    _stressInterestRate.placeholder = "Stress - Interest rate";

    const _stressSpread: TextInput = new TextInput();
    _stressSpread.id = "_stressSpread";
    _stressSpread.placeholder = "Stress - Spread";

    const _stressCurrency: TextInput = new TextInput();
    _stressCurrency.id = "_stressCurrency";
    _stressCurrency.placeholder = "Stress - Currency";

    this.stressInputs = [_stressInterestRate, _stressSpread, _stressCurrency]


    this.textInputs = [
      _isin, _issuer, _issueDate, _maturityDate, _rate, _manager,
      _amount, _percentagePrice, _issuerType, _creditCurve, _yieldCurve,
      _bbgid
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
    this.addItem(_stressIncludeInStress);
    this.stressInputs.forEach((input) => this.addItem(input));
  }
}