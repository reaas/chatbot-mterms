import { ISINCard } from "./isinCard"

test('isinCard value set test', () => {
    const card = new ISINCard();
    card.instrument.text = 'TESTTESTTEST';
    expect(card.instrument.text).toBe('TESTTESTTEST')
})