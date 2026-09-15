import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { LoginScreen } from './src/auth/LoginScreen';
import { SignupScreen } from './src/auth/SignupScreen';
import { StudentsScreen } from './src/students/StudentsScreen';

type AuthStackParams = {
  Login: undefined;
  Signup: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();

function LoginWrapper({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'Login'>): React.ReactElement {
  return (
    <LoginScreen
      onSwitchToSignup={() => {
        navigation.navigate('Signup');
      }}
    />
  );
}

function SignupWrapper({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'Signup'>): React.ReactElement {
  return (
    <SignupScreen
      onSwitchToLogin={() => {
        navigation.navigate('Login');
      }}
    />
  );
}

function AuthNavigator(): React.ReactElement {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginWrapper} />
      <AuthStack.Screen name="Signup" component={SignupWrapper} />
    </AuthStack.Navigator>
  );
}

function AppNavigator(): React.ReactElement {
  const { state } = useAuth();
  if (state.status === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }
  return state.status === 'unauthenticated' ? <AuthNavigator /> : <StudentsScreen />;
}

export default function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
});
