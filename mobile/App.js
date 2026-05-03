import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import HelloUser from "./components/HelloUser";
import Counter from "./components/Counter";
export default function App() {
  return (
    <View style={styles.container}>
      <HelloUser name="Darma" />
      <Counter />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});