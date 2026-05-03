import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';

const Stack = createNativeStackNavigator();

export default function StackNav() {
  return (
    <Stack.Navigator>

      {/* Tugas 1 (Home) */}
      <Stack.Screen 
        name="Tugas1"
        component={Tugas1}
        options={{ title: 'Tugas 1' }}
      />

      {/* Tugas 2 */}
      <Stack.Screen 
        name="Tugas2"
        component={Tugas2}
        options={{ title: 'Tugas 2' }}
      />

      {/* Tugas 3 */}
      <Stack.Screen 
        name="Tugas3"
        component={Tugas3}
        options={{ title: 'Tugas 3' }}
      />

    </Stack.Navigator>
  );
}