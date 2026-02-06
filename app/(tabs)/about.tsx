import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const logo: ImageSourcePropType = require('@/assets/images/LOGO.png');

export default function AboutScreen() {
  const router = useRouter();

  const openFaiWebsite = async () => {
    await WebBrowser.openBrowserAsync('https://www.fondoambiente.it/');
  };

  const openGithubRepo = async () => {
    await WebBrowser.openBrowserAsync('https://github.com/GiacomoGuaresi/FAI-nder');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>FAInder</Text>
          <Text style={styles.version}>Versione 1.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cos'è FAInder?</Text>
          <Text style={styles.sectionText}>
            FAInder è un'applicazione mobile che ti aiuta a scoprire e visitare i beni culturali 
            del Fondo Ambiente Italiano (FAI). Con FAInder puoi esplorare luoghi storici, 
            parchi e giardini in tutta Italia.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funzionalità</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="map" size={20} color="#e74f30" style={styles.featureIcon} />
              <Text style={styles.featureText}>Mappa interattiva dei beni FAI</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="list" size={20} color="#e74f30" style={styles.featureIcon} />
              <Text style={styles.featureText}>Elenco completo dei luoghi</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#e74f30" style={styles.featureIcon} />
              <Text style={styles.featureText}>Salva i tuoi preferiti</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={20} color="#e74f30" style={styles.featureIcon} />
              <Text style={styles.featureText}>Traccia i luoghi visitati</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sviluppatore</Text>
          <Text style={styles.sectionText}>
            FAInder è stato sviluppato con ❤️ da Giacomo Guaresi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.sectionText}>
              🚨 FAInder non è un'applicazione ufficiale del Fondo Ambiente Italiano (FAI).
            </Text>
            <Text style={styles.sectionText}>
              📱 È un progetto indipendente sviluppato a scopo non commerciale e senza fini di lucro.
            </Text>
            <Text style={styles.sectionText}>
              🌍 L'app mira a promuovere la conoscenza e la visita dei beni culturali italiani.
            </Text>
            <Text style={styles.sectionText}>
              🔓 Il codice sorgente è completamente open source e disponibile su GitHub.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open Source</Text>
          <Text style={styles.sectionText}>
            Contribuisci allo sviluppo di FAInder! Il progetto è open source e accetta 
            contributi dalla community.
          </Text>
          <TouchableOpacity 
            style={styles.githubButton}
            onPress={openGithubRepo}
          >
            <Ionicons name="logo-github" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Vedi su GitHub</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.faiWebsiteButton}
          onPress={openFaiWebsite}
        >
          <Ionicons name="globe" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Visita il sito FAI</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Italian cultural heritage
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 48,
    tintColor: '#e74f30',
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  faiWebsiteButton: {
    backgroundColor: '#e74f30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    gap: 8,
  },
  githubButton: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
