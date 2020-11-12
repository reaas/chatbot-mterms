import { DBClient } from "./dbClient"

const client = new DBClient();

test("DBClient connect test", async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
})

test('DBClient getDocumentByISIN() test', async () => {
    await client.connect();
    const result = await client.getDocumentByISIN("NO0010273360")
    
    expect(result.ISIN).toBe("NO0010273360")
    expect(result.Instrument).toBe("ENTRA EIENDOM AS 05/10 3,75%")
    expect(result.AccruedDayCountConvention).toBe("Act/365")
    expect(result.TermDate).toBe("2005-06-23")
    expect(result.InterestRate).toBe(0)
    expect(result.DaysInPeriod).toBe(0)
})