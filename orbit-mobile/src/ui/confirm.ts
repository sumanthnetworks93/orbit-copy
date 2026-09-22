import { Alert } from 'react-native';

export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm, style: 'destructive' },
  ]);
}
