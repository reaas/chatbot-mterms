import { InternalAPI } from "../src/app/internalAPI/internalAPI";

const internalAPI = new InternalAPI();

test("Internal API getInstrumentById test", async () => {
    const instrument: Instrument = await internalAPI.getInstrumentById('1');
    console.log(instrument);
    expect(true).toBe(true);
})