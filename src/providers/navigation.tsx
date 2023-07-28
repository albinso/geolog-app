import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { DistanceScreen } from '../screens/distance';
import { OnboardingScreen } from '../screens/onboarding';
import { OnboardingKeyScreen } from '../screens/onboardingkey';
import { DisplayScreen } from '../screens/display';

export type StackParamList = {
  Onboarding: undefined;
  OnboardingKey: undefined;
  Distance: undefined;
  Display: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export function NavigationProvider() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="OnboardingKey" component={OnboardingKeyScreen} />
        <Stack.Screen name="Distance" component={DistanceScreen} />
        <Stack.Screen name="Display" component={DisplayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
