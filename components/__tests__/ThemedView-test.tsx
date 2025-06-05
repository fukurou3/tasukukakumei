import * as React from 'react';
import renderer from 'react-test-renderer';
import { useColorScheme } from 'react-native';

import { ThemedView } from '../ThemedView';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return { ...RN, useColorScheme: jest.fn() };
});

describe('ThemedView', () => {
  it('applies light color', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const tree = renderer
      .create(<ThemedView lightColor="light" darkColor="dark" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies dark color', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const tree = renderer
      .create(<ThemedView lightColor="light" darkColor="dark" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
