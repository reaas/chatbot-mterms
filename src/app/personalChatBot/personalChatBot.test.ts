import { Dialog } from 'botbuilder-dialogs';
import { DialogTestClient } from 'botbuilder-testing';
import { PersonalChatBot } from './personalChatBot';


const pb = new PersonalChatBot();



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


