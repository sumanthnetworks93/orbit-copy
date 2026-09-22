import { Show, UserButton } from '@clerk/expo/web';
import { View } from 'react-native';
import { isClerkConfigured } from '../config/clerk';

export function ClerkUserButton() {
  if (!isClerkConfigured) {
    return <View testID="clerk-user-button" />;
  }

  return (
    <Show when="signed-in">
      <div data-testid="clerk-user-button" style={{ display: 'flex', justifyContent: 'center' }}>
        <UserButton />
      </div>
    </Show>
  );
}
