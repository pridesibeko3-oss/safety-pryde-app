import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import LandingScreen from "./src/screens/LandingScreen";
import ProtectedScreen from "./src/screens/ProtectedScreen";
import GuardianScreen from "./src/screens/GuardianScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Protected" component={ProtectedScreen} />
        <Stack.Screen name="Guardian" component={GuardianScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
