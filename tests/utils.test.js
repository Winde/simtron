import {
  isMessage,
  isMessageToChannel,
  isFromUser,
  messageContainsText,
} from '../src/utils';

test('It should check if a given event is a message', () => {
  const notAMessage = {
    type: 'NotAMessage',
  };

  const messageWithoutText = {
    type: 'message',
    text: '',
  };

  const properMessage = {
    type: 'message',
    text: 'hello world',
  };

  expect(isMessage(notAMessage)).toBe(false);
  expect(isMessage(messageWithoutText)).toBe(false);
  expect(isMessage(properMessage)).toBe(true);
});
