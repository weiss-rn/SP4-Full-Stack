import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ItemCard from './components/ItemCard';
import InputRow from './components/InputRow';
import EmptyState from './components/EmptyState';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState([]);

  const handleTambah = (trimmedText) => {
    const newItem = { id: Date.now().toString(), name: trimmedText };
    setItems(prev => [...prev, newItem]);
    setInputText('');
  };

  const handleHapus = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <ItemCard item={item} onDelete={handleHapus} />
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Belanja</Text>
      <InputRow 
        inputValue={inputText}
        onInputChange={setInputText}
        onAddItem={handleTambah}
      />
      <Text style={styles.countLabel}>{items.length} item</Text>
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  countLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
});