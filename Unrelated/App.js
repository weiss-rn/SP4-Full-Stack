import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StackNav from './components/StackNav';
import DrawerNav from './components/DrawerNav';
import BottomTabsNav from './components/BottomTabsNav';
import MaterialBottomTabsNav from './components/MaterialBottomTabsNav';
import MaterialTopTabsNav from './components/MaterialTopTabsNav';
import {
  appNavigationTheme,
  navPalette,
  rootStackScreenOptions,
} from './components/navigationTheme';

const Stack = createNativeStackNavigator();
const menuItems = [
  { key: 'Stack', title: 'Native Stack', subtitle: 'Simple stack navigation', icon: 'layers-outline' },
  { key: 'Drawer', title: 'Drawer', subtitle: 'Side navigation layout', icon: 'menu' },
  { key: 'BottomTabs', title: 'Bottom Tabs', subtitle: 'Classic bottom bar', icon: 'view-day-outline' },
  {
    key: 'MaterialBottomTabs',
    title: 'Material Bottom Tabs',
    subtitle: 'Material Tab',
    icon: 'dock-bottom',
  },
  {
    key: 'MaterialTopTabs',
    title: 'Material Top Tabs',
    subtitle: 'Material Tab (BUGGED From Expo)',
    icon: 'tab-search',
  },
];

function MainMenu({ navigation }) {
  return (
    <View style={styles.menuScreen}>
      <Text style={styles.heroTitle}>Navigator Tugas</Text>
      <Text style={styles.heroSubtitle}>Menu Utama</Text>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => navigation.navigate(item.key)}
            style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name={item.icon} size={22} color={navPalette.accent} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={navPalette.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={appNavigationTheme}>
        <Stack.Navigator screenOptions={rootStackScreenOptions}>
          <Stack.Screen name="Menu" component={MainMenu} />
          <Stack.Screen name="Stack" component={StackNav} options={{ title: 'Native Stack' }} />
          <Stack.Screen name="Drawer" component={DrawerNav} options={{ title: 'Drawer' }} />
          <Stack.Screen name="BottomTabs" component={BottomTabsNav} options={{ title: 'Bottom Tabs' }} />
          <Stack.Screen
            name="MaterialBottomTabs"
            component={MaterialBottomTabsNav}
            options={{ title: 'Material Bottom Tabs' }}
          />
          <Stack.Screen
            name="MaterialTopTabs"
            component={MaterialTopTabsNav}
            options={{ title: 'Material Top Tabs' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  menuScreen: {
    flex: 1,
    backgroundColor: navPalette.background,
    padding: 20,
  },
  heroTitle: {
    color: navPalette.accent,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: navPalette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: navPalette.surface,
    borderWidth: 1,
    borderColor: navPalette.border,
    borderRadius: 18,
    padding: 16,
  },
  menuCardPressed: {
    opacity: 0.88,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2E8CF',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: navPalette.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuSubtitle: {
    color: navPalette.muted,
    fontSize: 13,
  },
});
