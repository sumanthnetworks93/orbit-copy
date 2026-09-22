import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, elevation } from '../theme/colors';

type Props = {
  children: ReactNode;
  testID?: string;
};

export function Surface({ children, testID }: Props) {
  return (
    <View style={styles.card} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 10,
    ...elevation.card,
  },
});
