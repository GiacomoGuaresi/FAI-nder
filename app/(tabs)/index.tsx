import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface FaiPoint {
  id: number;
  title: string;
  lat: number;
  lng: number;
  url: string;
  description?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const FAI_DATA_URL = 'https://raw.githubusercontent.com/GiacomoGuaresi/FAI-nder/refs/heads/main/data/beni-fai.json';
const VISITED_STORAGE_KEY = 'fai_visited_places';

const generateMapHTML = (faiPoints: FaiPoint[], visitedIds: Set<number>, userLocation?: Location.LocationObject) => {
  const userLat = userLocation?.coords.latitude ?? 45.4642;
  const userLng = userLocation?.coords.longitude ?? 9.19;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        html, body, #map {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .leaflet-control-zoom {
          display: none !important;
        }
        .location-button {
          position: absolute;
          top: 10px;
          right: 16px;
          z-index: 1000;
          background: white;
          border: none;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 18px;
          height: 30px;
          width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .location-button:hover {
          background: #f8f8f8;
          transform: scale(1.05);
        }
        .location-button:active {
          transform: scale(0.95);
        }
        .location-icon {
          width: 8px;
          height: 8px;
          background-color: #007AFF;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="location-button" onclick="goToUserLocation()">
        <div class="location-icon"></div>
      </div>
      
      <script>
        var map = L.map('map', {
          center: [${userLat}, ${userLng}],
          zoom: 13,
          zoomControl: false
        });
        var userLocation = [${userLat}, ${userLng}];
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(map);
        
        // Add user location with custom blue marker
        var userIcon = L.divIcon({
          html: '<div style="background-color: #007AFF; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [8, 8],
          iconAnchor: [4, 4],
          className: 'user-location-marker'
        });
        L.marker(userLocation, {icon: userIcon}).addTo(map).bindPopup('La tua posizione');
        
        // Add markers in batches to avoid blocking
        var markersData = ${JSON.stringify(faiPoints.map(point => ({
          lat: point.lat,
          lng: point.lng,
          title: point.title,
          id: point.id,
          isVisited: visitedIds.has(point.id)
        })))};
        
        var batchSize = 50;
        var currentIndex = 0;
        
        function addBatch() {
          var endIndex = Math.min(currentIndex + batchSize, markersData.length);
          
          for (var i = currentIndex; i < endIndex; i++) {
            var point = markersData[i];
            var color = point.isVisited ? '#666666' : '#e74f30';
            var opacity = point.isVisited ? 0.4 : 1;
            
            // Custom FAI marker - red/gray pin
            var faiIcon = L.divIcon({
              html: '<div style="background-color: ' + color + '; opacity: ' + opacity + '; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              className: 'fai-marker'
            });
            
            var marker = L.marker([point.lat, point.lng], {icon: faiIcon})
              .addTo(map)
              .bindPopup('<b>' + point.title + '</b><br><a href="#" onclick="onMarkerClick(' + point.id + ', \\'' + point.title + '\\', \\'' + point.url + '\\', ' + point.isVisited + ')">Apri dettagli</a>');
            
            // Store point ID for later updates
            marker._faiPointId = point.id;
          }
          
          currentIndex = endIndex;
          
          if (currentIndex < markersData.length) {
            setTimeout(addBatch, 10);
          } else {
            console.log('Added all ' + markersData.length + ' markers');
          }
        }
        
        function goToUserLocation() {
          map.setView(userLocation, 15);
        }
        
        function onMarkerClick(pointId, pointTitle, pointUrl, isVisited) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress', 
            data: {
              id: pointId, 
              title: pointTitle, 
              url: pointUrl, 
              isVisited: isVisited
            }
          }));
        }
        
        function updateMarkerColor(pointId, isVisited) {
          // Find and update marker color without reloading map
          var color = isVisited ? '#666666' : '#e74f30';
          var opacity = isVisited ? 0.4 : 1;
          console.log('Updating marker ' + pointId + ' to color: ' + color);
        }
        
        // Handle messages from React Native
        document.addEventListener('message', function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.type === 'setCenter') {
              map.setView([data.lat, data.lng], data.zoom || 15);
            } else if (data.type === 'updateMarker') {
              // Update specific marker without recentering
              var pointId = data.data.id;
              var isVisited = data.data.isVisited;
              var color = isVisited ? '#666666' : '#e74f30';
              var opacity = isVisited ? 0.4 : 1;
              
              map.eachLayer(function(layer) {
                if (layer._latlng && layer._faiPointId === pointId) {
                  var newIcon = L.divIcon({
                    html: '<div style="background-color: ' + color + '; opacity: ' + opacity + '; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    className: 'fai-marker'
                  });
                  layer.setIcon(newIcon);
                }
              });
            } else if (data.type === 'setVisitedStatus') {
              // Update all markers with visited status
              var visitedIds = new Set(data.data);
              map.eachLayer(function(layer) {
                if (layer._latlng && layer._faiPointId) {
                  var isVisited = visitedIds.has(layer._faiPointId);
                  var color = isVisited ? '#666666' : '#e74f30';
                  var opacity = isVisited ? 0.4 : 1;
                  // Update marker icon
                  var newIcon = L.divIcon({
                    html: '<div style="background-color: ' + color + '; opacity: ' + opacity + '; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    className: 'fai-marker'
                  });
                  layer.setIcon(newIcon);
                }
              });
            } else if (data.type === 'updateMarkers') {
              // Just update markers without changing view
              console.log('Updating markers without recentering');
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });
        
        window.addEventListener('message', function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.type === 'setCenter') {
              map.setView([data.lat, data.lng], data.zoom || 15);
            } else if (data.type === 'updateMarker') {
              // Update specific marker without recentering
              var pointId = data.data.id;
              var isVisited = data.data.isVisited;
              var color = isVisited ? '#666666' : '#e74f30';
              var opacity = isVisited ? 0.4 : 1;
              
              map.eachLayer(function(layer) {
                if (layer._latlng && layer._faiPointId === pointId) {
                  var newIcon = L.divIcon({
                    html: '<div style="background-color: ' + color + '; opacity: ' + opacity + '; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    className: 'fai-marker'
                  });
                  layer.setIcon(newIcon);
                }
              });
            } else if (data.type === 'setVisitedStatus') {
              // Update all markers with visited status
              var visitedIds = new Set(data.data);
              map.eachLayer(function(layer) {
                if (layer._latlng && layer._faiPointId) {
                  var isVisited = visitedIds.has(layer._faiPointId);
                  var color = isVisited ? '#666666' : '#e74f30';
                  var opacity = isVisited ? 0.4 : 1;
                  // Update marker icon
                  var newIcon = L.divIcon({
                    html: '<div style="background-color: ' + color + '; opacity: ' + opacity + '; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    className: 'fai-marker'
                  });
                  layer.setIcon(newIcon);
                }
              });
            } else if (data.type === 'updateMarkers') {
              // Just update markers without changing view
              console.log('Updating markers without recentering');
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });
        
        // Start adding markers after map is ready
        setTimeout(addBatch, 1000);
      </script>
    </body>
    </html>
  `;
};

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
  const mapRef = useRef<WebView>(null);

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
      
      // Send update message to WebView to change marker color
      if (mapRef.current) {
        mapRef.current.postMessage(JSON.stringify({
          type: 'updateMarker',
          data: {
            id: id,
            isVisited: newSet.has(id)
          }
        }));
      }
      
      // Find the point and center map on it
      const point = faiPoints.find(p => p.id === id);
      if (point && mapRef.current) {
        mapRef.current.postMessage(JSON.stringify({
          type: 'setCenter',
          lat: point.lat,
          lng: point.lng
        }));
      }
      
      AsyncStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...newSet]));
      return newSet;
    });
  }, [faiPoints]);

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
    
    if (mapRef.current) {
      mapRef.current.postMessage(JSON.stringify({
        type: 'setCenter',
        lat: lat,
        lng: lng,
        zoom: 15
      }));
    }
    
    setShowSearchResults(false);
    setSearchQuery(result.display_name);
  };

  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'markerPress') {
      const point = faiPoints.find(p => p.id === data.data.id);
      if (point) {
        setSelectedPoint(point);
      }
    }
  };

  // Search only on enter and blur, not while typing

  useEffect(() => {
    // Send visited status to WebView after it loads
    const timer = setTimeout(() => {
      if (mapRef.current && visitedIds.size > 0) {
        mapRef.current.postMessage(JSON.stringify({
          type: 'setVisitedStatus',
          data: Array.from(visitedIds)
        }));
      }
    }, 2000); // Wait for map to load
    
    return () => clearTimeout(timer);
  }, [visitedIds]);

  // Auto-zoom to first search result
  useEffect(() => {
    if (searchResults.length > 0) {
      handleSearchResultPress(searchResults[0]);
    }
  }, [searchResults]);

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
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                searchLocation(searchQuery);
              }
            }}
            onBlur={() => {
              if (searchQuery.trim()) {
                searchLocation(searchQuery);
              }
            }}
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoading} />
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <WebView
        ref={mapRef}
        style={styles.map}
        source={{ html: generateMapHTML(faiPoints, new Set(), location || undefined) }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        key={`${faiPoints.length}-${location?.coords.latitude}-${location?.coords.longitude}`}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Caricamento mappa...</Text>
          </View>
        )}
      />
      
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
            {selectedPoint?.description ? (
              <Text style={styles.modalDescription}>{selectedPoint.description}</Text>
            ) : (
              <Text style={styles.modalDescriptionPlaceholder}>Nessuna descrizione disponibile</Text>
            )}
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
    right: 81,
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  clearButton: {
    marginLeft: 8,
    padding: 4,
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
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalDescriptionPlaceholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
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
