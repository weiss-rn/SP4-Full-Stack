import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import { navPalette } from './navigationTheme';

const Tab = createMaterialBottomTabNavigator();

export default function MaterialBottomTabsNav() {
  return (
    <Tab.Navigator
      initialRouteName="Tugas1"
      shifting={false}
      labeled={true}
      activeColor={navPalette.accent}
      inactiveColor={navPalette.muted}
      barStyle={{
        backgroundColor: navPalette.surface,
        borderTopWidth: 1,
        borderTopColor: navPalette.border,
      }}
    >

      <Tab.Screen 
        name="Tugas1"
        component={Tugas1}
        options={{
          title: 'Tugas 1',
          tabBarLabel: 'Tugas 1',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="shape-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="Tugas2"
        component={Tugas2}
        options={{
          title: 'Tugas 2',
          tabBarLabel: 'Tugas 2',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="Tugas3"
        component={Tugas3}
        options={{
          title: 'Tugas 3',
          tabBarLabel: 'Tugas 3',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="counter" size={22} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}
