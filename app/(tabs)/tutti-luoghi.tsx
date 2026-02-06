import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FaiPoint {
  id: number;
  title: string;
  lat: number;
  lng: number;
  url: string;
  description?: string;
}

const FAI_DATA_URL = 'https://raw.githubusercontent.com/GiacomoGuaresi/FAI-nder/main/data/beni-fai.json';
const FAVORITES_STORAGE_KEY = 'fai_favorites_places';
const NOT_INTERESTED_STORAGE_KEY = 'fai_not_interested_places';
const VISITED_STORAGE_KEY = 'fai_visited_places';

// Funzione per decodificare entità HTML
const decodeHtmlEntities = (text: string): string => {
  const entityMap: { [key: string]: string } = {
    '&#39;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&agrave;': 'à',
    '&egrave;': 'è',
    '&eacute;': 'é',
    '&igrave;': 'ì',
    '&ograve;': 'ò',
    '&ugrave;': 'ù',
    '&Agrave;': 'À',
    '&Egrave;': 'È',
    '&Eacute;': 'É',
    '&Igrave;': 'Ì',
    '&Ograve;': 'Ò',
    '&Ugrave;': 'Ù',
    '&nbsp;': ' ',
    '&euro;': '€',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '\'',
    '&rsquo;': '\'',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&hellip;': '…'
  };

  let decoded = text;
  Object.entries(entityMap).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  });
  
  return decoded;
};

// Funzione per tagliare testo a 200 caratteri
const truncateText = (text: string, maxLength: number = 200): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

export default function TuttiLuoghiScreen() {
  const [loading, setLoading] = useState(true);
  const [faiPoints, setFaiPoints] = useState<FaiPoint[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set());
  const [notInterestedIds, setNotInterestedIds] = useState<Set<number>>(new Set());
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(FAI_DATA_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FaiPoint[] = await response.json();
        setFaiPoints(data);
      } catch (error) {
        console.error('Error fetching FAI points:', error);
        // Fallback to local data if remote fails
        try {
          const localData = require('../../data/beni-fai.json');
          setFaiPoints(localData);
        } catch (localError) {
          console.error('Error loading local data:', localError);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const [favoritesStored, notInterestedStored, visitedStored] = await Promise.all([
            AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
            AsyncStorage.getItem(NOT_INTERESTED_STORAGE_KEY),
            AsyncStorage.getItem(VISITED_STORAGE_KEY)
          ]);
          
          if (favoritesStored) {
            setFavoritesIds(new Set(JSON.parse(favoritesStored)));
          }
          if (notInterestedStored) {
            setNotInterestedIds(new Set(JSON.parse(notInterestedStored)));
          }
          if (visitedStored) {
            setVisitedIds(new Set(JSON.parse(visitedStored)));
          }
        } catch (error) {
          console.error('Error loading stored data:', error);
        }
      })();
    }, [])
  );

  // Filter properties that are not in favorites, not interested, or visited
  // Sort all properties alphabetically
  const otherProperties = faiPoints
    .filter(point => !favoritesIds.has(point.id) && !notInterestedIds.has(point.id) && !visitedIds.has(point.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'it', { sensitivity: 'base' }));

  const openFaiWebsite = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Errore', 'Impossibile aprire il sito web');
    }
  };

  const renderPropertyItem = ({ item }: { item: FaiPoint }) => (
    <TouchableOpacity style={styles.propertyItem} onPress={() => openFaiWebsite(item.url)}>
      <View style={styles.propertyHeader}>
        <Text style={styles.propertyTitle}>{decodeHtmlEntities(item.title)}</Text>
        <Ionicons name="open-outline" size={20} color="#e74f30" />
      </View>
      {item.description && (
        <Text style={styles.propertyDescription}>{truncateText(decodeHtmlEntities(item.description))}</Text>
      )}
      <Text style={styles.linkText}>Tocca per aprire il sito FAI</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento beni FAI...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {otherProperties.length > 0 ? (
        <FlatList
          data={otherProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nessun altro luogo disponibile</Text>
          <Text style={styles.emptySubtext}>Tutti i luoghi sono stati categorizzati</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  propertyItem: {
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#e74f30',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
