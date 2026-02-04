<div align="center">
  <img src="assets/images/LOGO.png" alt="FAInder Logo" width="200"/>
  <h1>FAInder</h1>
</div>

FAInder è un progetto **open source** che raccoglie e rende consultabili, in forma geografica, alcuni luoghi e attività presenti sulla piattaforma pubblica del Fondo Ambiente Italiano (FAI).

Il progetto nasce con l'obiettivo di **facilitare la ricerca e la scoperta** di luoghi di interesse culturale, storico e territoriale, attraverso una rappresentazione su mappa semplice e accessibile.

## 📱 App Mobile

FAInder include un'applicazione mobile nativa per iOS e Android che permette di:

- **Esplorare la mappa** dei beni FAI con la propria posizione
- **Tracciare i luoghi visitati** con un sistema di check-in
- **Visualizzare i dettagli** di ogni bene e accedere alla pagina ufficiale FAI
- **Consultare la propria "Carta FAI"** con le statistiche di progresso

L'app è sviluppata con React Native/Expo e offre un'esperienza utente ottimizzata per dispositivi mobili.

---

## 🎯 Obiettivo del progetto

FAInder ha uno scopo **puramente informativo e sperimentale**:

- aggregare dati pubblicamente accessibili
- trasformarli in un formato leggero (JSON) adatto a mappe e applicazioni
- consentire la consultazione rapida dei luoghi tramite coordinate geografiche
- rimandare sempre alla pagina ufficiale del luogo sul sito FAI

Il progetto **non sostituisce**, **non replica** e **non intende competere** con i servizi ufficiali del FAI.

---

## � Setup Sviluppo

### Prerequisiti
- Node.js (v18 o superiore)
- Expo CLI
- Account Google Cloud per Google Maps API

### Configurazione Google Maps

1. **Ottieni una API Key**:
   - Vai su [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Crea un nuovo progetto o seleziona uno esistente
   - Abilita le API necessarie:
     - Maps SDK for Android
     - Maps SDK for iOS
     - (Opzionale) Places API per la ricerca

2. **Configura le variabili d'ambiente**:
   ```bash
   # Copia il template .env
   cp .env.example .env
   
   # Modifica .env con la tua API key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=la_tua_api_key_qui
   ```

3. **Installa le dipendenze**:
   ```bash
   npm install
   ```

4. **Avvia l'app**:
   ```bash
   npm start
   # oppure
   expo start
   ```

### Build di Produzione

Per la build di produzione, assicurati che:
- La API key sia configurata correttamente nel file `.env`
- Le API necessarie siano abilitate nel tuo progetto Google Cloud
- La API key abbia le restrizioni corrette per Android/iOS

```bash
# Build Android
expo build:android

# Build iOS  
expo build:ios
```

---

## �📦 Contenuto del repository

Il repository include:

- uno script di scraping che interroga le API pubbliche del FAI
- un file JSON generato automaticamente contenente:
  - coordinate geografiche
  - nome del luogo
  - link alla pagina ufficiale FAI
- una semplice applicazione che utilizza questi dati per mostrarli su mappa

Il file JSON viene aggiornato automaticamente tramite GitHub Actions.

---

## 🔗 Fonte dei dati

I dati provengono esclusivamente da **endpoint pubblici** della piattaforma:

https://platform.fondoambiente.it

Vengono utilizzate **solo informazioni già accessibili pubblicamente**, senza autenticazione, login o aggiramento di sistemi di protezione.

---

## ⚠️ Disclaimer e dissociazione

Questo progetto **NON è affiliato, sponsorizzato o approvato** dal Fondo Ambiente Italiano (FAI).

- Il nome “FAI” è di proprietà del Fondo Ambiente Italiano.
- Tutti i contenuti testuali, multimediali e informativi restano di proprietà dei rispettivi titolari.
- FAInder si limita a **rimandare alle pagine ufficiali** del sito FAI, senza duplicarne i contenuti.

Se il FAI o altri titolari dei diritti ritengono che questo progetto violi in qualsiasi modo le loro policy, sono invitati a contattare l’autore per una rapida rimozione o modifica.

---

## 🧭 Utilizzo dei dati

I dati generati da questo progetto sono destinati a:

- ricerca
- sperimentazione
- visualizzazione geografica
- uso educativo e non commerciale

Non è garantita l’accuratezza, completezza o attualità delle informazioni.

---

## 🛠️ Tecnologie utilizzate

### Backend e Dati
- Python (scraping e normalizzazione dati)
- GitHub Actions (aggiornamento automatico)
- JSON / GeoJSON

### App Mobile
- React Native con Expo
- React Native Maps per la visualizzazione geografica
- AsyncStorage per il tracciamento locale
- Expo Location per i servizi di geolocalizzazione

### Web
- Applicazione web client-side per la visualizzazione

---

## 📜 Licenza

Il codice del progetto è distribuito sotto licenza **MIT**.  
I dati rimangono soggetti alle condizioni d’uso del sito di origine.

---

## ✉️ Contatti

Per segnalazioni, richieste o problemi:
- apri una **Issue** su GitHub
- oppure contatta l’autore tramite il profilo GitHub
