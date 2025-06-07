// __tests__/App.test.tsx
import { render } from '@testing-library/react-native';
import App from '../App';

test('アプリがレンダリングできる', () => {
  const screen = render(<App />);
  expect(screen.toJSON()).toBeTruthy();
});
