import { Action, AdaptiveCard, Choice, ChoiceSetInput, Container, HorizontalAlignment, SubmitAction, TextBlock, TextInput, TextSize, ToggleInput, VerticalAlignment } from "adaptivecards";
import { Attachment } from "botbuilder";
import { InternalAPI } from "../internalAPI/internalAPI";
import { Form } from "./abstractForm";

export class BuyForm extends Form {
  textInputs: TextInput[];
  stressInputs: TextInput[];
  actions: Action[];

  _issuerType: ChoiceSetInput = new ChoiceSetInput();
  _creditCurve: ChoiceSetInput = new ChoiceSetInput();
  _yieldCurve: ChoiceSetInput = new ChoiceSetInput();
  internalAPI: InternalAPI = new InternalAPI();

  constructor(header: string, subheader: string) {
    super(header, subheader);

    // Preloading types and curves
    this.setDropdowns();

    // Inputs
    const _isinLabel: TextBlock = new TextBlock("ISIN");
    _isinLabel.size = TextSize.Small;
    const _isin: TextInput = new TextInput();
    _isin.id = "_isin";
    _isin.placeholder = "ISIN";

    const _issuerLabel: TextBlock = new TextBlock("Issuer");
    _issuerLabel.size = TextSize.Small;
    const _issuer: TextInput = new TextInput();
    _issuer.id = "_issuer";
    _issuer.placeholder = "Issuer";

    const _issueDateLabel: TextBlock = new TextBlock("Issue date");
    _issueDateLabel.size = TextSize.Small;
    const _issueDate: TextInput = new TextInput();
    _issueDate.id = "_issueDate";
    _issueDate.placeholder = "Issue date";

    const _maturityDateLabel: TextBlock = new TextBlock("Maturity date");
    _maturityDateLabel.size = TextSize.Small;
    const _maturityDate: TextInput = new TextInput();
    _maturityDate.id = "_maturityDate";
    _maturityDate.placeholder = "Maturity date";

    const _rateLabel: TextBlock = new TextBlock("Rate");
    _rateLabel.size = TextSize.Small;
    const _rate: TextInput = new TextInput();
    _rate.id = "_rate";
    _rate.placeholder = "Rate";

    const _managerLabel: TextBlock = new TextBlock("Manager");
    _managerLabel.size = TextSize.Small;
    const _manager: TextInput = new TextInput();
    _manager.id = "_manager";
    _manager.placeholder = "Manager";

    const _amountLabel: TextBlock = new TextBlock("Amount");
    _amountLabel.size = TextSize.Small;
    const _amount: TextInput = new TextInput();
    _amount.id = "_amount";
    _amount.placeholder = "Amount";

    const _percentagePriceLabel: TextBlock = new TextBlock("Percentage price");
    _percentagePriceLabel.size = TextSize.Small;
    const _percentagePrice: TextInput = new TextInput();
    _percentagePrice.id = "_percentagePrice";
    _percentagePrice.placeholder = "Percentage price";

    const _issuerTypeLabel: TextBlock = new TextBlock("Issuer type");
    _issuerTypeLabel.size = TextSize.Small;
    this._issuerType.id = "_issuerType";
    this._issuerType.placeholder = "Issuer type";
    this._issuerType.choices = [new Choice('Issuer type', 'null')];

    const _creditCurveLabel: TextBlock = new TextBlock("Credit curve");
    _creditCurveLabel.size = TextSize.Small;
    this._creditCurve.id = "_creditCurve";
    this._creditCurve.placeholder = "Credit curve";
    this._creditCurve.choices = [new Choice('Credit curve', 'null')];

    const _yieldCurveLabel: TextBlock = new TextBlock("Yield curve");
    _yieldCurveLabel.size = TextSize.Small;
    this._yieldCurve.id = "_yieldCurve";
    this._yieldCurve.placeholder = "Yield curve";
    this._yieldCurve.choices = [new Choice('Yield curve', 'null')];

    const _bbgidLabel: TextBlock = new TextBlock("FIGI");
    _bbgidLabel.size = TextSize.Small;
    const _bbgid: TextInput = new TextInput();
    _bbgid.id = "_figi";
    _bbgid.placeholder = "FIGI";

    // Stress inputs
    const _stressIncludeInStress: ToggleInput = new ToggleInput();
    _stressIncludeInStress.id = "_stressIncludeInStress";
    _stressIncludeInStress.title = "Include in stress";

    const _stressInterestRateLabel: TextBlock = new TextBlock("Stress - Interest rate");
    _stressInterestRateLabel.size = TextSize.Small;
    const _stressInterestRate: TextInput = new TextInput();
    _stressInterestRate.id = "_stressInterestRate";
    _stressInterestRate.placeholder = "Stress - Interest rate";

    const _stressSpreadLabel: TextBlock = new TextBlock("Stress - Spread");
    _stressSpreadLabel.size = TextSize.Small;
    const _stressSpread: TextInput = new TextInput();
    _stressSpread.id = "_stressSpread";
    _stressSpread.placeholder = "Stress - Spread";

    const _stressCurrencyLabel: TextBlock = new TextBlock("Stress - Currency");
    _stressCurrencyLabel.size = TextSize.Small;
    const _stressCurrency: TextInput = new TextInput();
    _stressCurrency.id = "_stressCurrency";
    _stressCurrency.placeholder = "Stress - Currency";

    this.stressInputs = [_stressInterestRate, _stressSpread, _stressCurrency]


    this.textInputs = [
      _isin, _issuer, _issueDate, _maturityDate, _rate, _manager,
      _amount, _percentagePrice, _bbgid
    ];


    // Actions
    const submit: Action = new SubmitAction();
    submit.title = "Send";

    this.actions = [submit];

    // Adding everything to card
    this.addItem(this.header);
    this.addItem(this.subheader);

    this.addItem(_isinLabel);
    this.addItem(_isin);
    this.addItem(_issuerLabel);
    this.addItem(_issuer);
    this.addItem(_issueDateLabel);
    this.addItem(_issueDate);
    this.addItem(_maturityDateLabel);
    this.addItem(_maturityDate);
    this.addItem(_rateLabel);
    this.addItem(_rate);
    this.addItem(_managerLabel);
    this.addItem(_manager);
    this.addItem(_amountLabel);
    this.addItem(_amount);
    this.addItem(_percentagePriceLabel);
    this.addItem(_percentagePrice);

    this.addItem(_creditCurveLabel);
    this.addItem(this._creditCurve);

    this.addItem(_yieldCurveLabel);
    this.addItem(this._yieldCurve);

    this.addItem(_issuerTypeLabel);
    this.addItem(this._issuerType);

    this.addItem(_stressIncludeInStress);

    this.addItem(_stressInterestRateLabel);
    this.addItem(_stressInterestRate);
    this.addItem(_stressSpreadLabel);
    this.addItem(_stressSpread);
    this.addItem(_stressCurrencyLabel);
    this.addItem(_stressCurrency);

    this.actions.forEach((action) => this.addAction(action));
  }

  setDropdowns = (): Promise<void> => new Promise<void>(async (resolve) => {
    const issuerTypes = await this.internalAPI.getIssuerTypes();
    this._issuerType.choices = issuerTypes.map(it => new Choice(it.Value, it.Key));

    const priceCurves = await this.internalAPI.getPriceCurves();
    this._creditCurve.choices = priceCurves.map(pc => new Choice(pc.Value, pc.Key));
    this._yieldCurve.choices = priceCurves.map(pc => new Choice(pc.Value, pc.Key));

    resolve();
  });

  fillForm(): Promise<Attachment> {
    throw new Error("Method not implemented.");
  }
}