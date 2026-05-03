import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ItemCard({ item, onDelete }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View style={styles.dot} />
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.hapusBtn}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.hapusBtnText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 12,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7F77DD',
  },
  itemText: {
    fontSize: 15,
    color: '#1A1A1A',
    flexShrink: 1,
  },
  hapusBtn: {
    backgroundColor: '#FCEBEB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hapusBtnText: {
    color: '#A32D2D',
    fontWeight: '600',
    fontSize: 12,
  },
});
