import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const logo: ImageSourcePropType = require('@/assets/images/LOGO.png');

function CustomHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>FAInder</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 16,
  },
  logo: {
    width: 80,
    height: 32,
    tintColor: '#e74f30',
    marginRight: -20,
    marginLeft: -20,
  },
  themeBar: {
    height: 28,
    backgroundColor: '#e74f30',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeSidebarButton: {
    padding: 8,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  propertiesHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  propertiesHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Account for back button width
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  placeholder: {
    width: 40, // Match back button width for centering
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  
  // Animation values
  const sidebarTranslateX = useRef(new Animated.Value(-280)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? -280 : 0;
    const overlayToValue = isSidebarOpen ? 0 : 1;

    setIsSidebarOpen(!isSidebarOpen);

    // Animate sidebar
    Animated.spring(sidebarTranslateX, {
      toValue,
      tension: 300,
      friction: 30,
      useNativeDriver: true,
    }).start();

    // Animate overlay
    Animated.timing(overlayOpacity, {
      toValue: overlayToValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const navigateToLuoghiPreferiti = () => {
    toggleSidebar();
    router.push('/(tabs)/luoghi-preferiti');
  };

  const navigateToLuoghiVisitati = () => {
    toggleSidebar();
    router.push('/(tabs)/luoghi-visitati');
  };

  const navigateToLuoghiNonInteressati = () => {
    toggleSidebar();
    router.push('/(tabs)/luoghi-non-interessati');
  };

  const navigateToTuttiLuoghi = () => {
    toggleSidebar();
    router.push('/(tabs)/tutti-luoghi');
  };

  const navigateToAbout = () => {
    toggleSidebar();
    router.push('/(tabs)/about');
  };

  const openFaiWebsite = async () => {
    toggleSidebar();
    await WebBrowser.openBrowserAsync('https://www.fondoambiente.it/');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sidebar Overlay */}
      <Animated.View 
        style={[styles.overlay, { opacity: overlayOpacity }]} 
        pointerEvents={isSidebarOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      </Animated.View>
      
      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar, 
          { transform: [{ translateX: sidebarTranslateX }] }
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={toggleSidebar} style={styles.closeSidebarButton}>
            <Ionicons name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
        <View style={styles.sidebarContent}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToLuoghiPreferiti}
          >
            <Ionicons name="star" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Luoghi Preferiti</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToLuoghiVisitati}
          >
            <Ionicons name="checkmark-circle" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Luoghi Visitati</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToLuoghiNonInteressati}
          >
            <Ionicons name="eye-off" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Luoghi Non Interessati</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToTuttiLuoghi}
          >
            <Ionicons name="map" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Tutti gli Altri Luoghi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToAbout}
          >
            <Ionicons name="information-circle-outline" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={openFaiWebsite}
          >
            <Ionicons name="globe" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Sito FAI</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Barra arancione */}
      <View style={styles.themeBar} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#e74f30',
          tabBarStyle: {
            backgroundColor: 'white',
          },
          tabBarActiveBackgroundColor: '#e74f30',
          headerShown: true,
          header: () => <CustomHeader />,
          headerStyle: {
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          },
          headerTintColor: '#e74f30',
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color }) => <Ionicons name="menu" size={28} color={color} />,
            headerShown: false,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              toggleSidebar();
            },
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mappa beni',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Tessera FAI',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="luoghi-preferiti"
          options={{
            title: 'Luoghi Preferiti',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: true,
            header: () => (
              <View style={styles.propertiesHeader}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.propertiesHeaderTitle}>Luoghi Preferiti</Text>
                <View style={styles.placeholder} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="luoghi-visitati"
          options={{
            title: 'Luoghi Visitati',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: true,
            header: () => (
              <View style={styles.propertiesHeader}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.propertiesHeaderTitle}>Luoghi Visitati</Text>
                <View style={styles.placeholder} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="luoghi-non-interessati"
          options={{
            title: 'Luoghi Non Interessati',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: true,
            header: () => (
              <View style={styles.propertiesHeader}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.propertiesHeaderTitle}>Luoghi Non Interessati</Text>
                <View style={styles.placeholder} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tutti-luoghi"
          options={{
            title: 'Tutti gli Altri Luoghi',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: true,
            header: () => (
              <View style={styles.propertiesHeader}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.propertiesHeaderTitle}>Tutti gli Altri Luoghi</Text>
                <View style={styles.placeholder} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: 'About',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: false, // Use custom header in the component
          }}
        />
      </Tabs>
    </View>
  );
}
