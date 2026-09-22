import { ActionRow } from './ActionRow';
import { DeskButton } from './DeskButton';

type Props = {
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmTestID?: string;
};

export function ConfirmRow({ confirmLabel, onConfirm, onCancel, confirmTestID }: Props) {
  return (
    <ActionRow>
      <DeskButton testID={confirmTestID ?? 'confirm-yes'} label={confirmLabel} variant="ink" onPress={onConfirm} />
      <DeskButton testID="confirm-cancel" label="Cancel" variant="ghost" onPress={onCancel} />
    </ActionRow>
  );
}
