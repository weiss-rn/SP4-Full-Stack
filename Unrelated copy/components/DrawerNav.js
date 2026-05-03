import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import Tugas1 from '../screens/Tugas1';
import Tugas2 from '../screens/Tugas2';
import Tugas3 from '../screens/Tugas3';
import Tugas4 from '../screens/Tugas4';

const drawerRoutes = [
  { key: 'tugas1', title: 'Tugas 1', component: Tugas1 },
  { key: 'tugas2', title: 'Tugas 2', component: Tugas2 },
  { key: 'tugas3', title: 'Tugas 3', component: Tugas3 },
  { key: 'tugas4', title: 'Tugas 4', component: Tugas4 },
];

export default function DrawerNav() {
  const [open, setOpen] = useState(false);
  const [activeRouteKey, setActiveRouteKey] = useState(drawerRoutes[0].key);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const activeRoute = useMemo(
    () => drawerRoutes.find((route) => route.key === activeRouteKey) ?? drawerRoutes[0],
    [activeRouteKey]
  );

  const ActiveScreen = activeRoute.component;

  const handleSelectRoute = (routeKey) => {
    setActiveRouteKey(routeKey);
    if (!isLargeScreen) {
      setOpen(false);
    }
  };

  const renderDrawerContent = () => (
    <View style={styles.drawerContent}>
      <Text style={styles.drawerTitle}>Pilih Tugas</Text>
      {drawerRoutes.map((route) => {
        const isActive = route.key === activeRoute.key;

        return (
          <Pressable
            key={route.key}
            onPress={() => handleSelectRoute(route.key)}
            style={[styles.drawerItem, isActive && styles.drawerItemActive]}
          >
            <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>
              {route.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Drawer
      drawerType={isLargeScreen ? 'permanent' : 'front'}
      open={isLargeScreen ? true : open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderDrawerContent={renderDrawerContent}
      swipeEnabled={!isLargeScreen}
      drawerStyle={styles.drawer}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {!isLargeScreen && (
            <Pressable onPress={() => setOpen((previousOpen) => !previousOpen)} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>{open ? 'Tutup' : 'Menu'}</Text>
            </Pressable>
          )}
          <Text style={styles.headerTitle}>{activeRoute.title}</Text>
        </View>

        <View style={styles.screenContainer}>
          <ActiveScreen />
        </View>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EC',
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#1F3C88',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  menuButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F4B942',
  },
  menuButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
  },
  drawer: {
    width: 264,
    backgroundColor: '#FFF8E8',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FFF8E8',
  },
  drawerTitle: {
    marginBottom: 20,
    color: '#1F3C88',
    fontSize: 22,
    fontWeight: '700',
  },
  drawerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#F2E8CF',
  },
  drawerItemActive: {
    backgroundColor: '#1F3C88',
  },
  drawerItemText: {
    color: '#273043',
    fontSize: 16,
    fontWeight: '600',
  },
  drawerItemTextActive: {
    color: '#FFFFFF',
  },
});
