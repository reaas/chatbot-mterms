//import { Dialog } from 'botbuilder-dialogs';
import { DialogTestClient } from 'botbuilder-testing';
import { PersonalChatBot } from './personalChatBot';
import { BotFrameworkAdapter, ConsoleTranscriptLogger, ConversationState, MemoryStorage, UserState } from "botbuilder";
import { MainDialog } from "../dialogs/MainDialog";

let conversationState: ConversationState;
let userState: UserState;
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);
const dialog = new MainDialog("mainDialog");
const pb = new PersonalChatBot(conversationState, userState, dialog);

const mockInstrument: Instrument = {
    id: "IT2839184728",
    name: "Aker ASA 12/22 FRN",
    isin: "NO0010657398",
    issueDate: "2012-09-07T00:00:00",
    maturityDate: "2022-09-07T00:00:00",
    rateDetails: "NIBOR3M",
    type: "Bond",
    figi: "123"
  }

test('fillBuyForm test', async () => {
    pb.fillBuyForm(mockInstrument, "100");
    // eslint:ignore next line
    const isin = pb.buyForm.textInputs.find(i => i.id === '_isin')?._propertyBag.value;
    console.log(isin);
    expect(isin).toBe("NO0010657398");
});

test('isISIN test', () => {
    expect(pb.isISIN('ZZ9A9A9BB260')).toBe(true);
    expect(pb.isISIN('ZZ9A9A9wrerye260')).toBe(false);
});

test('containsNumber test', () => {
    expect(pb.containsNumber('100ABC')).toBe(true);
    expect(pb.containsNumber('ABC')).toBe(false);
});

test('isFormMessage test', () => {
    expect(pb.isFormMessage('form')).toBe(true);
    expect(pb.isFormMessage('ABC ABC form')).toBe(true);
    expect(pb.isFormMessage('ABC ABC ABC')).toBe(false);
});


