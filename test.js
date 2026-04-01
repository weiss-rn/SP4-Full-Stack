import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import AssetExample from './components/AssetExample';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Latihan FlexBox</Text>
        <View style={styles.headerContent}>
          <View style={[styles.square, styles.black]} />
          <View style={[styles.circle, styles.green]} />
          <View style={[styles.circle, styles.red]} />
          <View style={[styles.circle, styles.blue]} />
        </View>
      </View>
      <View style={styles.middleSectionUpper}>
        <View style={[styles.square, styles.redMid]} />
        <View style={[styles.square, styles.blue]} />
        <View style={[styles.square, styles.darkGreen]} />
      </View>
      <View style={styles.middleSectionLower}>
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.leftColumn}>
          <View style={[styles.square, styles.blue]} />
          <View style={[styles.square, styles.yellow]} />
          <View style={[styles.square, styles.red]} />
        </View>
        <View style={styles.rightGreen} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#228B22',
  },
  header: {
    backgroundColor: '#87CEEB',
    padding: 10,
  },
  headerText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  square: {
    width: 50,
    height: 50,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  black: {
    backgroundColor: '#000000',
  },
  green: {
    backgroundColor: '#228B22',
  },
  red: {
    backgroundColor: '#FF0000',
  },
  redMid: {
    backgroundColor: '#FF0000',
    marginRight: 50,
  },
  blue: {
    backgroundColor: '#0000FF',
  },
  darkGreen: {
    backgroundColor: '#006400',
  },
  yellow: {
    backgroundColor: '#FFFF00',
  },
  middleSectionUpper: {
    backgroundColor: '#FFFF00',
    flexDirection: 'row',
    paddingVertical: 1,
  },
  middleSectionLower: {
    backgroundColor: '#FFFF00',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  bottomSection: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: 80,
  },
  rightGreen: {
    flex: 1,
    backgroundColor: '#228B22',
  },
});