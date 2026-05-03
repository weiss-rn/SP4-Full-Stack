import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import Tugas4 from '../screens/Tugas4';
import { navPalette } from './navigationTheme';

const Tab = createBottomTabNavigator();
const tabIcons = {
  Tugas1: 'shape-outline',
  Tugas2: 'account-group-outline',
  Tugas3: 'counter',
  Tugas4: 'cart-outline',
};

export default function BottomTabsNav() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: navPalette.accent,
        tabBarInactiveTintColor: navPalette.muted,
        tabBarStyle: {
          backgroundColor: navPalette.surface,
          borderTopWidth: 1,
          borderTopColor: navPalette.border,
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name] || 'circle-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >

      <Tab.Screen 
        name="Tugas1" 
        component={Tugas1} 
        options={{ title: 'Tugas 1' }}
      />

      <Tab.Screen 
        name="Tugas2" 
        component={Tugas2} 
        options={{ title: 'Tugas 2' }}
      />

      <Tab.Screen 
        name="Tugas3" 
        component={Tugas3} 
        options={{ title: 'Tugas 3' }}
      />
      <Tab.Screen 
        name="Tugas4" 
        component={Tugas4} 
        options={{ title: 'Tugas 4' }}
      />

    </Tab.Navigator>
  );
}
