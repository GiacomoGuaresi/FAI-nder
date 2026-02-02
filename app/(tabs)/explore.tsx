import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

const PDF_STORAGE_KEY = 'fai_card_pdf';

export default function TabTwoScreen() {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    loadSavedPdf();
  }, []);

  const loadSavedPdf = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PDF_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPdfUri(parsed.uri);
        setMimeType(parsed.mimeType);
      }
    } catch (error) {
      console.error('Error loading saved PDF:', error);
    }
  };

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        const mimeType = result.assets[0].mimeType || 'application/pdf';
        
        setPdfUri(uri);
        setMimeType(mimeType);
        
        await AsyncStorage.setItem(PDF_STORAGE_KEY, JSON.stringify({ 
          uri, 
          mimeType
        }));
        
        Alert.alert('Successo', 'Carta FAI caricata correttamente!');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Errore', 'Impossibile caricare il documento. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const openPdf = () => {
    if (!pdfUri) return;
    
    // Visualizza a schermo intero
    setShowFullScreen(true);
  };

  const removePdf = async () => {
    try {
      setPdfUri(null);
      setMimeType(null);
      await AsyncStorage.removeItem(PDF_STORAGE_KEY);
      Alert.alert('Successo', 'Carta FAI rimossa correttamente!');
    } catch (error) {
      console.error('Error removing PDF:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Carta FAI
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        {!pdfUri ? (
          <View style={styles.uploadContainer}>
            <IconSymbol name="doc.badge.plus" size={64} color="#e74f30" style={styles.uploadIcon} />
            <ThemedText style={styles.uploadText}>
              Carica la tua carta FAI
            </ThemedText>
            <ThemedText style={styles.uploadSubtext}>
              Seleziona il file PDF o l'immagine della tua tessera FAI
            </ThemedText>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <ThemedText style={styles.buttonText}>Carica PDF/Immagine</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pdfContainer}>
            <View style={styles.pdfHeader}>
              <ThemedText style={styles.pdfTitle}>La tua Carta FAI</ThemedText>
              <TouchableOpacity style={styles.removeButton} onPress={removePdf}>
                <Ionicons name="trash" size={16} color="#e74f30" />
                <ThemedText style={styles.removeButtonText}>Rimuovi</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.pdfPreview}>
              {mimeType?.startsWith('image/') ? (
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => setShowFullScreen(true)}>
                    <Image
                      source={{ uri: pdfUri }}
                      style={styles.cardImage}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <IconSymbol name="doc.fill" size={64} color="#e74f30" style={styles.pdfIcon} />
                  <ThemedText style={styles.pdfInfo}>
                    PDF caricato correttamente
                  </ThemedText>
                </>
              )}
              <TouchableOpacity style={styles.openButton} onPress={openPdf}>
                <View style={styles.buttonContent}>
                  <Ionicons name="eye" size={20} color="white" />
                  <ThemedText style={styles.buttonText}>Visualizza {mimeType?.startsWith('image/') ? 'Immagine' : 'PDF'}</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
      
      {/* Modal per visualizzazione a schermo intero */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
      >
        <TouchableOpacity 
          style={styles.fullScreenOverlay} 
          activeOpacity={1}
          onPress={() => setShowFullScreen(false)}
        >
          <TouchableOpacity 
            style={styles.fullScreenContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.closeFullScreenButton}
              onPress={() => setShowFullScreen(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: pdfUri! }}
              style={styles.fullScreenImage}
              contentFit="contain"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contentContainer: {
    padding: 20,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  uploadIcon: {
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#e74f30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pdfContainer: {
    flex: 1,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e74f30',
  },
  removeButtonText: {
    color: '#e74f30',
    fontSize: 12,
    fontWeight: '600',
  },
  pdfViewer: {
    height: 600,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pdfPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  pdfIcon: {
    marginBottom: 16,
  },
  pdfInfo: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  openButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
