import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface FaiPoint {
  id: number;
  title: string;
  lat: number;
  lng: number;
  url: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const FAI_DATA_URL = 'https://raw.githubusercontent.com/GiacomoGuaresi/FAI-nder/refs/heads/main/data/beni-fai.json';
const VISITED_STORAGE_KEY = 'fai_visited_places';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [faiPoints, setFaiPoints] = useState<FaiPoint[]>([]);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [selectedPoint, setSelectedPoint] = useState<FaiPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLocationLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(FAI_DATA_URL);
        const data: FaiPoint[] = await response.json();
        setFaiPoints(data);
      } catch (error) {
        console.error('Error fetching FAI points:', error);
      } finally {
        setPointsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(VISITED_STORAGE_KEY);
        if (stored) {
          setVisitedIds(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Error loading visited places:', error);
      }
    })();
  }, []);

  const toggleVisited = useCallback(async (id: number) => {
    setVisitedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      AsyncStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...newSet]));
      return newSet;
    });
  }, []);

  const openInBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=it`,
        {
          headers: {
            'User-Agent': 'FAI-nder/1.0 (giacomoguaresi.dev@gmail.com)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        setSearchResults([]);
        setShowSearchResults(true);
        return;
      }
      
      try {
        const data: SearchResult[] = JSON.parse(text);
        setSearchResults(data);
        setShowSearchResults(true);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        setSearchResults([]);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultPress = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    setShowSearchResults(false);
    setSearchQuery(result.display_name);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (locationLoading || pointsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {pointsLoading ? 'Caricamento punti FAI...' : 'Ottenendo la posizione...'}
        </Text>
        {pointsLoading && (
          <Text style={styles.loadingSubtext}>
            Potrebbero volerci alcuni secondi
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca un indirizzo o luogo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => searchQuery && setShowSearchResults(true)}
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoading} />
          )}
        </View>
        
        {showSearchResults && (
          <View style={styles.searchResultsContainer}>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultPress(result)}
                >
                  <Ionicons name="location" size={16} color="#007AFF" style={styles.resultIcon} />
                  <Text style={styles.searchResultText}>{result.display_name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Nessun risultato trovato</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: location?.coords.latitude ?? 45.4642,
          longitude: location?.coords.longitude ?? 9.19,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {faiPoints.map((point) => {
          const isVisited = visitedIds.has(point.id);
          return (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              pinColor={isVisited ? '#666666' : '#FF0000'}
              opacity={isVisited ? 0.4 : 1}
              onPress={() => setSelectedPoint(point)}
            />
          );
        })}
      </MapView>
      
      <Modal
        visible={selectedPoint !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPoint(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setSelectedPoint(null)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPoint(null)}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{selectedPoint?.title}</Text>
            {selectedPoint && visitedIds.has(selectedPoint.id) && (
              <View style={styles.visitedBadge}>
                <Ionicons name="checkmark" size={12} color="#4CAF50" />
                <Text style={styles.visitedBadgeText}> Già visitato</Text>
              </View>
            )}
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.visitButton]}
                onPress={() => {
                  if (selectedPoint) {
                    toggleVisited(selectedPoint.id);
                  }
                }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons 
                    name={selectedPoint && visitedIds.has(selectedPoint.id) ? "close-circle" : "checkmark-circle"} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.modalButtonText}>
                    {selectedPoint && visitedIds.has(selectedPoint.id) ? 'Non visitato' : 'Visitato'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.detailsButton]}
                onPress={() => {
                  if (selectedPoint) {
                    openInBrowser(selectedPoint.url);
                  }
                }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="globe" size={16} color="white" />
                  <Text style={styles.modalButtonText}>Dettagli</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 66,
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchLoading: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  visitedBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  visitButton: {
    backgroundColor: '#4CAF50',
  },
  detailsButton: {
    backgroundColor: '#e74f30',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
