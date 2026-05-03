import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import Tugas4 from '../screens/Tugas4';


const Tab = createMaterialTopTabNavigator();

export default function MaterialTopTabsNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFF8E8',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E6D7B9',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#173B7A',
          height: 3,
        },
        tabBarActiveTintColor: '#173B7A',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '700',
          textTransform: 'none',
        },
        tabBarPressColor: 'rgba(23, 59, 122, 0.12)',
      }}
    >

      <Tab.Screen 
        name="Tugas1" 
        component={Tugas1} 
        options={{ title: 'Tugas 1', tabBarLabel: 'Tugas 1' }}
      />

      <Tab.Screen 
        name="Tugas2" 
        component={Tugas2} 
        options={{ title: 'Tugas 2', tabBarLabel: 'Tugas 2' }}
      />

      <Tab.Screen 
        name="Tugas3" 
        component={Tugas3} 
        options={{ title: 'Tugas 3', tabBarLabel: 'Tugas 3' }}
      />

      <Tab.Screen 
        name="Tugas4" 
        component={Tugas4} 
        options={{ title: 'Tugas 4', tabBarLabel: 'Tugas 4' }}
      />
    </Tab.Navigator>
  );
}
