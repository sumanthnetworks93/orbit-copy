import { Platform } from 'react-native';
import { Account, Client, TablesDB } from 'react-native-appwrite';

export const APPWRITE_ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? 'https://fra.cloud.appwrite.io/v1';

export const APPWRITE_PROJECT_ID =
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? '6a9a36c10010254849a2';

export const APPWRITE_DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? 'orbit';

export const APPWRITE_TABLES = {
  jobs: 'jobs',
  startups: 'startups',
  applications: 'applications',
  messages: 'messages',
  profiles: 'profiles',
  savedStartups: 'saved_startups',
} as const;

export const APPWRITE_CALLBACK_SCHEME = `appwrite-callback-${APPWRITE_PROJECT_ID}`;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  client.setPlatform('com.orbit.app');
}

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export { client };
