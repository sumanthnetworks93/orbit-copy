import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  visible: boolean;
  title: string;
  testID?: string;
  children: ReactNode;
  onClose: () => void;
};

export function DeskSheet({ visible, title, testID, children, onClose }: Props) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay} testID={testID}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,20,15,0.28)',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    ...elevation.float,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 8,
  },
});
