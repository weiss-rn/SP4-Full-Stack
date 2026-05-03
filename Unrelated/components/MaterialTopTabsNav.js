import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import Tugas4 from '../screens/Tugas4';
import { navPalette } from './navigationTheme';


const Tab = createMaterialTopTabNavigator();
const renderTopTabLabel = (label) => ({ color, focused }) => (
  <Text
    style={[
      styles.tabLabel,
      { color: color || (focused ? navPalette.accent : navPalette.muted) },
    ]}
    numberOfLines={1}
  >
    {label}
  </Text>
);

export default function MaterialTopTabsNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: navPalette.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: navPalette.border,
        },
        tabBarIndicatorStyle: {
          backgroundColor: navPalette.accent,
          height: 3,
          borderRadius: 999,
        },
        tabBarActiveTintColor: navPalette.accent,
        tabBarInactiveTintColor: navPalette.muted,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '700',
          textTransform: 'none',
        },
        tabBarItemStyle: {
          minWidth: 92,
        },
        tabBarPressColor: navPalette.accentSoft,
      }}
    >

      <Tab.Screen 
        name="Tugas1" 
        component={Tugas1} 
        options={{ title: 'Tugas 1', tabBarLabel: renderTopTabLabel('Tugas 1') }}
      />

      <Tab.Screen 
        name="Tugas2" 
        component={Tugas2} 
        options={{ title: 'Tugas 2', tabBarLabel: renderTopTabLabel('Tugas 2') }}
      />

      <Tab.Screen 
        name="Tugas3" 
        component={Tugas3} 
        options={{ title: 'Tugas 3', tabBarLabel: renderTopTabLabel('Tugas 3') }}
      />

      <Tab.Screen 
        name="Tugas4" 
        component={Tugas4} 
        options={{ title: 'Tugas 4', tabBarLabel: renderTopTabLabel('Tugas 4') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'none',
  },
});
