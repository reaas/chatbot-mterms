import { InternalAPI } from "../src/app/internalAPI/internalAPI";
const mockActivePortfolios = require('./activePortfolios.json');
const mockIssuerTypes = require('./issuerTypes.json');
const mockPriceCurves = require('./priceCurves.json');
const mockPriceByDateAndId = {
    "instrumentID": "IDnumber",
    "date": "1996-01-18T00:00:00",
    "value": 104.75727957249221
  }
const mockInstrument: Instrument = {
    id: "IT2839184728",
    name: "Aker ASA 12/22 FRN",
    isin: "NO0010657398",
    issueDate: "2012-09-07T00:00:00",
    maturityDate: "2022-09-07T00:00:00",
    rateDetails: "NIBOR3M",
    type: "Bond",
    figi: null
  }

const internalAPI = new InternalAPI();



test("Internal API getInstrumentById test", async () => {
    const instrument: Instrument = await internalAPI.getInstrumentById('IT2839184728');
    console.log(instrument);
    expect(instrument).toMatchObject(mockInstrument);  
})


test("Internal API getActivePortfolios test", async () => {
    const activePortfolios = await internalAPI.getActivePortfolios();
    expect(activePortfolios).toMatchObject(mockActivePortfolios);  
})

test("Internal API getIssuerTypes test", async () => {
    const issuerTypes = await internalAPI.getIssuerTypes();
    expect(issuerTypes).toMatchObject(mockIssuerTypes);
})

test("Internal API getPriceCurves test", async () => {
    const priceCurves = await internalAPI.getPriceCurves();
    expect(priceCurves).toMatchObject(mockPriceCurves);
})

test("Internal API getPriceByDateAndId test", async () => {
    const priceByDateAndId = await internalAPI.getPriceByDateAndId("1996-01-18", "IDnumber");
    expect(priceByDateAndId).toMatchObject(mockPriceByDateAndId);
})