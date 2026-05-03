import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
export default function Hitung() {
  const [count, setCount] = useState(0);
  return (
  <View style={styles.container}>
    <Text style={styles.text}>Jumlah: {count}</Text>
    <Button title="Tambah" onPress={() => setCount(count + 1)} />
    <Button title="Kurangi" onPress={() => setCount(count - 1)} />
    <Button title="Reset" onPress={() => setCount(0)} />
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});
