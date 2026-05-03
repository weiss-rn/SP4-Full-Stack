import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import Tugas4 from '../screens/Tugas4';

const Tab = createBottomTabNavigator();

export default function BottomTabsNav() {
  return (
    <Tab.Navigator>

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