import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/store/useAuth';
import { Home, Package, Map, Settings, User as UserIcon, Layers } from 'lucide-react-native';
import { ThemeProvider } from './src/store/useTheme';

// Screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import UserHomeScreen from './src/screens/user/UserHomeScreen';
import UserOrderScreen from './src/screens/user/UserOrderScreen';
import LiveTrackingScreen from './src/screens/user/LiveTrackingScreen';
import CourierHomeScreen from './src/screens/courier/CourierHomeScreen';
import CourierEarningsScreen from './src/screens/courier/CourierEarningsScreen';
import OrderPoolScreen from './src/screens/courier/OrderPoolScreen';
import TransactionsScreen from './src/screens/courier/TransactionsScreen';
import FinancialSummaryScreen from './src/screens/courier/FinancialSummaryScreen';
import TransactionDetailScreen from './src/screens/courier/TransactionDetailScreen';
import ProfileScreen from './src/screens/common/ProfileScreen';
import ReferralScreen from './src/screens/common/ReferralScreen';
import CreateOrderScreen from './src/screens/user/CreateOrderScreen';

// Settings Screens
import PersonalInfoScreen from './src/screens/common/settings/PersonalInfoScreen';
import VehicleInfoScreen from './src/screens/common/settings/VehicleInfoScreen';
import PaymentMethodsScreen from './src/screens/common/settings/PaymentMethodsScreen';
import SecuritySettingsScreen from './src/screens/common/settings/SecuritySettingsScreen';
import HelpCenterScreen from './src/screens/common/settings/HelpCenterScreen';
import AppSettingsScreen from './src/screens/common/settings/AppSettingsScreen';
import LiveSupportScreen from './src/screens/common/settings/LiveSupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Role Based Navigators ---

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#333', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Ana Sayfa" 
        component={UserHomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Siparişlerim" 
        component={UserOrderScreen} 
        options={{ tabBarIcon: ({ color }) => <Package color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}

function CourierTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#333', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="İşler" 
        component={CourierHomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Havuz" 
        component={OrderPoolScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Layers color={color} size={24} />
          ),
          tabBarBadge: undefined,
        }} 
      />
      <Tab.Screen 
        name="Kazanç" 
        component={CourierEarningsScreen} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Ayarlar" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <Settings color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}

// --- Main App Entry ---

export default function App() {
  const { user, token, loadStoredAuth } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadStoredAuth().finally(() => setIsReady(true));
  }, []);

  if (!isReady) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!token ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              {user?.role === 'COURIER' ? (
                <Stack.Screen name="CourierMain" component={CourierTabs} />
              ) : (
                <Stack.Screen name="UserMain" component={UserTabs} />
              )}
              <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
              <Stack.Screen name="Referral" component={ReferralScreen} />
              <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />
              
              {/* Settings Screens */}
              <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
              <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
              <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
              <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
              <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
              <Stack.Screen name="LiveSupport" component={LiveSupportScreen} />
              <Stack.Screen name="AppSettings" component={AppSettingsScreen} />

              {/* Courier specific extra screens */}
              <Stack.Screen name="Transactions" component={TransactionsScreen} />
              <Stack.Screen name="FinancialSummary" component={FinancialSummaryScreen} />
              <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
