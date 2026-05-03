import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Latihan FlexBox</Text>
        <View style={styles.headerContent}>
          <View style={[styles.headerBox, styles.black]} />
          <View style={[styles.circle, styles.green]} />
          <View style={[styles.circle, styles.red]} />
          <View style={[styles.circle, styles.blue]} />
        </View>
      </View>
      <View style={styles.middleSection}>
        <View style={[styles.box, styles.red]} />
        <View style={[styles.box, styles.blue]} />
        <View style={[styles.box, styles.darkGreen]} />
      </View>
      <View style={styles.bottomSection}>
        <View style={[styles.box, styles.blue]} />
        <View style={[styles.box, styles.yellow]} />
        <View style={[styles.box, styles.red]} />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF00', 
  },
  header: {
    backgroundColor: '#87CEEB',
    paddingTop: 45,
    paddingBottom: 20,
    marginBottom: 5,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#000000',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerBox: {
    width: 60,
    height: 60,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  middleSection: {
    backgroundColor: '#FFFF00',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:-5,
    paddingBottom: 25,
    marginBottom: 10,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#006400',
    flexDirection: 'column',
  },
  box: {
    width: 80,
    height: 80,
  },
  black: { backgroundColor: '#000000' },
  green: { backgroundColor: '#008000' },
  red: { backgroundColor: '#FF0000' },
  blue: { backgroundColor: '#0000FF' },
  darkGreen: { backgroundColor: '#006400' },
  yellow: { backgroundColor: '#FFFF00' },
});
