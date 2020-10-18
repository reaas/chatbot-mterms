import { BuyForm } from './buyForm'

const form = new BuyForm("header", "subheader");

test('BuyForm fumber of input fields', () => {
    expect(form.textInputs.length).toBe(6);
})

test('BuyForm number of actions', () => {
    expect(form.actions.length).toBe(1);
})