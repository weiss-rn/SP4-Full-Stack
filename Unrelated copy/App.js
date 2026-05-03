import React from 'react';
import { View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StackNav from './components/StackNav';
import DrawerNav from './components/DrawerNav';
import BottomTabsNav from './components/BottomTabsNav';
import MaterialBottomTabsNav from './components/MaterialBottomTabsNav';
import MaterialTopTabsNav from './components/MaterialTopTabsNav';

const Stack = createNativeStackNavigator();

function MainMenu({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Button title="Native Stack" onPress={() => navigation.navigate('Stack')} />
      <Button title="Drawer" onPress={() => navigation.navigate('Drawer')} />
      <Button title="Bottom Tabs" onPress={() => navigation.navigate('BottomTabs')} />
      <Button title="Material Bottom Tabs" onPress={() => navigation.navigate('MaterialBottomTabs')} />
      <Button title="Material Top Tabs" onPress={() => navigation.navigate('MaterialTopTabs')} />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Menu" component={MainMenu} />
          <Stack.Screen name="Stack" component={StackNav} />
          <Stack.Screen name="Drawer" component={DrawerNav} />
          <Stack.Screen name="BottomTabs" component={BottomTabsNav} />
          <Stack.Screen name="MaterialBottomTabs" component={MaterialBottomTabsNav} />
          <Stack.Screen name="MaterialTopTabs" component={MaterialTopTabsNav} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
