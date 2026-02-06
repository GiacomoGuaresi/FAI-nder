import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const logo: ImageSourcePropType = require('@/assets/images/LOGO.png');

function CustomHeader({ onMenuPress }: { onMenuPress: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu" size={24} color="#333333" />
      </TouchableOpacity>
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
    paddingLeft: 16,
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
  },
  logo: {
    width: 80,
    height: 32,
    tintColor: '#e74f30',
    marginRight: -20,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
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
  sidebarOpen: {
    transform: [{ translateX: 0 }],
  },
  sidebarClosed: {
    transform: [{ translateX: -280 }],
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateToProperties = () => {
    toggleSidebar();
    router.push('/(tabs)/properties');
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
      {isSidebarOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
      
      {/* Sidebar */}
      <View style={[styles.sidebar, isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={toggleSidebar} style={styles.closeSidebarButton}>
            <Ionicons name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
        <View style={styles.sidebarContent}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToProperties}
          >
            <Ionicons name="list" size={20} color="#e74f30" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Elenco Luoghi</Text>
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
      </View>

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
          header: () => <CustomHeader onMenuPress={toggleSidebar} />,
          headerStyle: {
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          },
          headerTintColor: '#e74f30',
          tabBarButton: HapticTab,
        }}>
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
          name="about"
          options={{
            title: 'About',
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: false, // Use custom header in the component
          }}
        />
        <Tabs.Screen
          name="properties"
          options={{
            title: 'Elenco Luoghi',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
            href: null, // Hide from tab bar, only accessible via sidebar
            tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
            headerShown: true,
            header: () => (
              <View style={styles.propertiesHeader}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.propertiesHeaderTitle}>Elenco Luoghi</Text>
                <View style={styles.placeholder} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
