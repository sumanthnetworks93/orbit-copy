import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppliedScreen } from '../screens/AppliedScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ControlScreen } from '../desks/admin/ControlScreen';
import { JobsScreen as AdminJobsScreen } from '../desks/admin/JobsScreen';
import { PeopleScreen } from '../desks/admin/PeopleScreen';
import { StaffScreen } from '../desks/admin/StaffScreen';
import { EmployerApplicantsScreen } from '../desks/employer/ApplicantsScreen';
import { EmployerBillingScreen } from '../desks/employer/BillingScreen';
import { EmployerCompanyScreen } from '../desks/employer/CompanyScreen';
import { EmployerJobsScreen } from '../desks/employer/JobsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { JobsFilterScreen } from '../screens/JobsFilterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StartupDetailScreen } from '../screens/StartupDetailScreen';
import { StartupsFilterScreen } from '../screens/StartupsFilterScreen';
import type {
  AdminTabParamList,
  AppliedStackParamList,
  EmployerTabParamList,
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './types';
import { useIsCompact } from '../hyd/useIsCompact';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const EmployerTab = createBottomTabNavigator<EmployerTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppliedStack = createNativeStackNavigator<AppliedStackParamList>();

function TabIcon({
  label,
  active,
  icon,
  iconActive,
}: {
  label: string;
  active: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconActive: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={[styles.tabItem, active && styles.tabItemActive]}>
      <View style={styles.tabIconBox}>
        <MaterialIcons
          name={active ? iconActive : icon}
          size={20}
          color={active ? colors.ink : colors.label}
        />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Feed" component={HomeScreen} initialParams={{ mode: 'jobs' }} />
      <HomeStack.Screen name="StartupsFilter" component={StartupsFilterScreen} />
      <HomeStack.Screen name="JobsFilter" component={JobsFilterScreen} />
      <HomeStack.Screen name="JobDetail" component={JobDetailScreen} />
      <HomeStack.Screen name="StartupDetail" component={StartupDetailScreen} />
    </HomeStack.Navigator>
  );
}

function AppliedNavigator() {
  return (
    <AppliedStack.Navigator screenOptions={{ headerShown: false }}>
      <AppliedStack.Screen name="AppliedList" component={AppliedScreen} />
      <AppliedStack.Screen name="JobDetail" component={JobDetailScreen} />
    </AppliedStack.Navigator>
  );
}

function MainTabs() {
  const compact = useIsCompact(600);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, compact && styles.tabBarCompact],
        tabBarButton: ({ href: _href, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={(state) => [
              typeof style === 'function' ? style(state) : style,
              styles.tabButton,
            ]}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarButtonTestID: 'tab-home',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Home"
              active={focused}
              icon="home"
              iconActive="home"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Applied"
        component={AppliedNavigator}
        options={{
          tabBarButtonTestID: 'tab-applied',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Applied"
              active={focused}
              icon="assignment"
              iconActive="assignment-turned-in"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButtonTestID: 'tab-profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Profile"
              active={focused}
              icon="person-outline"
              iconActive="person"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const compact = useIsCompact(600);
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, compact && styles.tabBarCompact],
        tabBarButton: ({ href: _href, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={(state) => [
              typeof style === 'function' ? style(state) : style,
              styles.tabButton,
            ]}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <AdminTab.Screen
        name="AdminHome"
        component={ControlScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-home',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Control" active={focused} icon="admin-panel-settings" iconActive="admin-panel-settings" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminPeople"
        component={PeopleScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-people',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="People" active={focused} icon="people" iconActive="people" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminJobs"
        component={AdminJobsScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-jobs',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Jobs" active={focused} icon="work-outline" iconActive="work" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminProfile"
        component={StaffScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Staff" active={focused} icon="person-outline" iconActive="person" />
          ),
        }}
      />
    </AdminTab.Navigator>
  );
}

function EmployerTabs() {
  const compact = useIsCompact(600);
  return (
    <EmployerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, compact && styles.tabBarCompact],
        tabBarButton: ({ href: _href, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={(state) => [
              typeof style === 'function' ? style(state) : style,
              styles.tabButton,
            ]}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <EmployerTab.Screen
        name="EmployerJobs"
        component={EmployerJobsScreen}
        options={{
          tabBarButtonTestID: 'employer-nav-jobs',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Jobs" active={focused} icon="work-outline" iconActive="work" />
          ),
        }}
      />
      <EmployerTab.Screen
        name="EmployerApplicants"
        component={EmployerApplicantsScreen}
        options={{
          tabBarButtonTestID: 'employer-nav-candidates',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Applicants" active={focused} icon="people-outline" iconActive="people" />
          ),
        }}
      />
      <EmployerTab.Screen
        name="EmployerBilling"
        component={EmployerBillingScreen}
        options={{
          tabBarButtonTestID: 'employer-nav-billing',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Billing" active={focused} icon="account-balance-wallet" iconActive="account-balance-wallet" />
          ),
        }}
      />
      <EmployerTab.Screen
        name="EmployerCompany"
        component={EmployerCompanyScreen}
        options={{
          tabBarButtonTestID: 'employer-nav-settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Company" active={focused} icon="business" iconActive="business" />
          ),
        }}
      />
    </EmployerTab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="Main"
            component={
              user.role === 'admin' ? AdminTabs : user.role === 'employer' ? EmployerTabs : MainTabs
            }
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  tabBar: {
    height: 68,
    maxHeight: 68,
    minHeight: 68,
    flexGrow: 0,
    flexShrink: 0,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopWidth: 0,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  tabBarCompact: {
    height: 60,
    maxHeight: 60,
    minHeight: 60,
    paddingTop: 2,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 56,
    maxWidth: 88,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tabIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabItemActive: {
    backgroundColor: colors.white,
    ...elevation.card,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.label,
  },
  tabLabelActive: {
    color: colors.ink,
  },
});

export type { RootStackParamList, MainTabParamList } from './types';
