import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

function CustomHeader() {
  return (
    <View style={styles.header}>
      <IconSymbol size={32} name="location.fill" color="white" />
      <Text style={styles.headerTitle}>FAInder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#e74f30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e74f30',
        tabBarInactiveTintColor: 'rgba(231, 79, 48, 0.6)',
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarActiveBackgroundColor: 'rgba(231, 79, 48, 0.1)',
        headerShown: true,
        header: () => <CustomHeader />,
        headerStyle: {
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mappa beni',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Carta FAI',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
