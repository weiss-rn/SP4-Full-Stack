import React from 'react';
import { View, Text, Button } from 'react-native';

export default function ScreenTemplate({ title, navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}