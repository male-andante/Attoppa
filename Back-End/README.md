# Backend Event Management System

Sistema di gestione eventi con autenticazione Google OAuth, gestione utenti, locations ed eventi.

## 🚀 Tecnologie Utilizzate

- Node.js
- Express.js
- MongoDB con Mongoose
- Passport.js per OAuth
- JWT per autenticazione
- Bcrypt per hashing password

## 📋 Prerequisiti

- Node.js (v14 o superiore)
- MongoDB
- Account Google Developer (per OAuth)

## 🔧 Configurazione

1. Clona il repository:
```bash
git clone [url-repository]
cd [nome-cartella]
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea un file `.env` nella root del progetto con le seguenti variabili:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
mongoUrl=mongodb://localhost:27017/
dbName=event_management

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

4. Configura Google OAuth:
   - Vai alla [Google Cloud Console](https://console.cloud.google.com)
   - Crea un nuovo progetto
   - Abilita Google+ API
   - Crea credenziali OAuth 2.0
   - Aggiungi gli URI di reindirizzamento autorizzati
   - Copia Client ID e Client Secret nel file `.env`

## 🏃‍♂️ Avvio del Progetto

1. Avvia il server in modalità sviluppo:
```bash
npm run dev
```

2. Per la produzione:
```bash
npm start
```

## 📁 Struttura del Progetto

```
├── models/                 # Modelli Mongoose
│   ├── userModel.js       # Schema utente
│   ├── eventModel.js      # Schema evento
│   └── locationModel.js   # Schema location
├── routes/                # Routes Express
│   ├── auth.js           # Routes autenticazione
│   ├── userRoutes.js     # Routes utenti
│   ├── eventRoutes.js    # Routes eventi
│   ├── locationRoutes.js # Routes locations
│   └── dashboardRoutes.js # Routes dashboard admin
├── middlewares/          # Middleware
│   ├── oAuthMiddleware.js # Google OAuth
│   └── adminMiddleware.js # Protezione routes admin
├── scripts/              # Script di utilità
│   ├── migrateUsers.js   # Migrazione utenti
│   └── testGoogleAuth.js # Test OAuth
└── server.js             # Entry point
```

## 🔐 API Endpoints

### Autenticazione
- `POST /auth/register` - Registrazione utente
- `POST /auth/login` - Login utente
- `GET /auth/google` - Login con Google
- `GET /auth/google/callback` - Callback Google OAuth
- `GET /auth/verify` - Verifica token

### Utenti
- `GET /users` - Lista utenti (admin)
- `GET /users/:id` - Dettaglio utente
- `PUT /users/:id` - Aggiorna utente
- `DELETE /users/:id` - Elimina utente

### Eventi
- `GET /events` - Lista eventi
- `GET /events/:id` - Dettaglio evento
- `POST /events` - Crea evento
- `PUT /events/:id` - Aggiorna evento
- `DELETE /events/:id` - Elimina evento

### Locations
- `GET /locations` - Lista locations
- `GET /locations/:id` - Dettaglio location
- `POST /locations` - Crea location
- `PUT /locations/:id` - Aggiorna location
- `DELETE /locations/:id` - Elimina location

### Dashboard Admin
- `GET /dashboard/stats` - Statistiche generali
- `GET /dashboard/users` - Gestione utenti
- `GET /dashboard/events` - Gestione eventi
- `GET /dashboard/locations` - Gestione locations

## 📊 Schema Database

### User
```javascript
{
  name: String,          // Nome utente
  username: String,      // Username univoco
  email: String,         // Email univoca
  password: String,      // Hash password (opzionale per Google)
  googleId: String,      // ID Google (per OAuth)
  isAdmin: Boolean,      // Ruolo admin
  verified: Boolean,     // Email verificata
  createdAt: Date        // Data creazione
}
```

### Event
```javascript
{
  title: String,         // Titolo evento
  description: String,   // Descrizione
  date: Date,           // Data evento
  startTime: String,    // Ora inizio (HH:mm)
  endTime: String,      // Ora fine (HH:mm)
  location: ObjectId,   // Riferimento location
  price: Number,        // Prezzo (0 per eventi gratuiti)
  maxParticipants: Number, // Max partecipanti
  contactEmail: String,  // Email contatto
  website: String,      // Sito web
  createdAt: Date       // Data creazione
}
```

### Location
```javascript
{
  name: String,         // Nome location
  address: String,      // Indirizzo
  city: String,         // Città
  capacity: Number,     // Capacità
  contactEmail: String, // Email contatto
  phone: String,        // Telefono
  website: String,      // Sito web
  createdAt: Date       // Data creazione
}
```

## 🔄 Script di Utilità

### Migrazione Utenti
```bash
node scripts/migrateUsers.js
```
- Migra gli utenti esistenti al nuovo schema
- Genera username unici
- Rimuove password placeholder per utenti Google

### Test Google Auth
```bash
node scripts/testGoogleAuth.js
```
- Testa la configurazione OAuth
- Simula il processo di autenticazione
- Mostra i dati ricevuti da Google

## 🔒 Sicurezza

- Autenticazione JWT
- Password hashing con bcrypt
- Validazione input
- Sanitizzazione dati
- Protezione routes admin
- Google OAuth 2.0

## 🐛 Debugging

Per il debugging, controlla i log della console. Gli errori vengono loggati con dettagli specifici per facilitare l'identificazione dei problemi.

## 📝 Note Aggiuntive

- Tutte le date sono gestite in formato ISO
- Le password devono essere almeno 8 caratteri
- Gli email sono sempre convertiti in lowercase
- Gli username sono generati automaticamente se non specificati
- Gli eventi gratuiti hanno prezzo 0
- Le locations devono avere capacità > 0

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli. 