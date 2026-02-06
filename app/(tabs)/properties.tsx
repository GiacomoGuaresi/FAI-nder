import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

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

export default function PropertiesScreen() {
  const [loading, setLoading] = useState(true);
  const [faiPoints, setFaiPoints] = useState<FaiPoint[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set());
  const [notInterestedIds, setNotInterestedIds] = useState<Set<number>>(new Set());
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
          const [favoritesStored, notInterestedStored] = await Promise.all([
            AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
            AsyncStorage.getItem(NOT_INTERESTED_STORAGE_KEY)
          ]);
          
          if (favoritesStored) {
            setFavoritesIds(new Set(JSON.parse(favoritesStored)));
          }
          if (notInterestedStored) {
            setNotInterestedIds(new Set(JSON.parse(notInterestedStored)));
          }
        } catch (error) {
          console.error('Error loading stored data:', error);
        }
      })();
    }, [])
  );

  // Filter and organize properties with alphabetical sorting
  const favoriteProperties = faiPoints
    .filter(point => favoritesIds.has(point.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'it', { sensitivity: 'base' }));
  
  const notInterestedProperties = faiPoints
    .filter(point => notInterestedIds.has(point.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'it', { sensitivity: 'base' }));
  
  const otherProperties = faiPoints
    .filter(point => !favoritesIds.has(point.id) && !notInterestedIds.has(point.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'it', { sensitivity: 'base' }));

  const renderPropertyItem = ({ item }: { item: FaiPoint }) => (
    <View style={styles.propertyItem}>
      <Text style={styles.propertyTitle}>{item.title}</Text>
    </View>
  );

  const renderSection = (title: string, data: FaiPoint[], emptyMessage: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
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
        <FlatList
          data={[
            { key: 'favorites', title: 'Beni Preferiti', data: favoriteProperties, emptyMessage: 'Nessun bene preferito' },
            { key: 'notInterested', title: 'Beni Non Interessanti', data: notInterestedProperties, emptyMessage: 'Nessun bene non interessante' },
            { key: 'other', title: 'Altri Beni', data: otherProperties, emptyMessage: 'Nessun altro bene disponibile' }
          ]}
          renderItem={({ item }) => renderSection(item.title, item.data, item.emptyMessage)}
          keyExtractor={(item) => item.key}
          style={styles.list}
        />
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  propertyItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
