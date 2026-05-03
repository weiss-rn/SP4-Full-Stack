import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    if (isPressed) {
      setPesan('Selamat datang di stikom');
    } else {
      setPesan('');
    }
  }, [isPressed]);

  return (
    <View style={styles.container}>
      

      <View style={styles.card}>
        <Text style={styles.title}>1. Component Counter</Text>
        <Text style={styles.counterText}>Nilai: {count}</Text>
        <Button 
          title="Tambah Nilai" 
          onPress={() => setCount(count + 1)} 
          color="#A57BFF"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>2. Contoh "useEffect" </Text>
        <View style={styles.pesanContainer}>
          <Text style={styles.pesanText}>{pesan}</Text>
        </View>

        <Button 
          title={isPressed ? "hapus text" : "buka text"} 
          onPress={() => setIsPressed(!isPressed)} 
          color="#D8A745"
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  counterText: {
    fontSize: 24,
    marginBottom: 15,
  },
  pesanContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  pesanText: {
    fontSize: 16,
    color: '#D2691E',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});