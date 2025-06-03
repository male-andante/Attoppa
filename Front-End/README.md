# Front-End Techno Events App

Applicazione React per la scoperta e gestione di eventi techno.

## Funzionalità

- Autenticazione utente (email/password e Google)
- Visualizzazione eventi vicini con geolocalizzazione
- Ricerca e filtro eventi
- Gestione interessi agli eventi
- Visualizzazione dettagli eventi e location
- Dashboard admin per la gestione di eventi e location
- Mappe interattive per la visualizzazione delle location

## Tecnologie Utilizzate

- React 18
- Vite
- React Router v6
- React Bootstrap
- Leaflet (mappe)
- React Icons
- Context API per la gestione dello stato

## Requisiti

- Node.js 16+
- npm 7+

## Installazione

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Copia il file `.env.example` in `.env` e configura le variabili d'ambiente:
   ```bash
   cp .env.example .env
   ```
4. Modifica il file `.env` con i tuoi valori:
   - `VITE_API_URL`: URL del backend (default: http://localhost:3000)
   - `VITE_GOOGLE_CLIENT_ID`: ID client Google per l'autenticazione

## Sviluppo

Per avviare il server di sviluppo:

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo http://localhost:5173

## Build

Per creare una build di produzione:

```bash
npm run build
```

I file di build saranno generati nella cartella `dist`

## Preview Build

Per visualizzare in anteprima la build di produzione:

```bash
npm run preview
```

## Struttura del Progetto

```
src/
  ├── components/        # Componenti riutilizzabili
  │   ├── auth/         # Componenti per l'autenticazione
  │   ├── events/       # Componenti per gli eventi
  │   ├── layout/       # Componenti di layout (Navbar, Footer, ecc.)
  │   └── locations/    # Componenti per le location
  ├── contexts/         # Context API
  ├── pages/            # Pagine dell'applicazione
  │   └── admin/        # Pagine della dashboard admin
  ├── services/         # Servizi API e configurazione
  └── utils/            # Utility functions
```

## Contribuire

1. Crea un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.
