import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

export default function InputRow({ inputValue, onInputChange, onAddItem }) {
  const handlePress = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      Alert.alert('Jgn Kosong kalau nambah!');
      return;
    }
    onAddItem(trimmed);
  };

  return (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        placeholder="Tambah item baru..."
        value={inputValue}
        onChangeText={onInputChange}
        onSubmitEditing={handlePress}
        returnKeyType="done"
      />
      <TouchableOpacity style={styles.tambahBtn} onPress={handlePress}>
        <Text style={styles.tambahBtnText}>Tambah</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  tambahBtn: {
    backgroundColor: '#7F77DD',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  tambahBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
