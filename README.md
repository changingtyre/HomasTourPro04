# Cykel Tour Manager 🚴

Et komplet system til at holde styr på resultaterne fra jeres cykelbrætspil gennem mange år!

## Funktioner

- ✅ **Ubegrænset antal** spil, spillere, hold, ryttere og løb
- ✅ **Endagsløb** (Monumenter, World Cup)
- ✅ **Etapeløb** (Tour de France, Giro, Vuelta) med:
  - Samlet klassement
  - Pointkonkurrence (sprint)
  - Bjergkonkurrence
  - Førertrøje bonuspoint
- ✅ **Automatisk beregning** af World Tour Points (UCI 1997)
- ✅ **Samlet stilling** for både ryttere og hold
- ✅ **Data gemmes lokalt** i din browser (localStorage)
- ✅ **Backup & Gendan** - Eksporter/importer data som JSON filer
- ✅ **Flyt data** mellem computere nemt

## Installation

### Download fra GitHub:
1. Gå til GitHub repository
2. Klik på den grønne **"Code"** knap
3. Vælg **"Download ZIP"**
4. Pak ZIP-filen ud på din computer
5. Find mappen og åbn `index.html` i din browser

**Alternativt med git:**
```bash
git clone [repository URL]
cd HomasTourPro04
```

### Start systemet:
- Dobbeltklik på `index.html` filen
- **ELLER** højreklik → "Åbn med" → Chrome/Firefox/Safari/Edge
- Systemet kører nu lokalt i din browser!

## Sådan bruger du systemet

### 1. Åbn systemet
Åbn filen `index.html` i din browser (Chrome, Firefox, Safari, Edge).

### 2. Opret et nyt spil
1. Klik på "Opret Nyt Spil"
2. Giv det et navn (f.eks. "Sæson 2024")

### 3. Tilføj spillere og hold
1. Gå til "Spillere & Hold"
2. Klik "Tilføj Spiller" og indtast navn
3. Klik "Tilføj Hold" for hver spiller
4. Tilføj ryttere til hvert hold

### 4. Opret et løb
1. Gå til "Løb"
2. Klik "Opret Nyt Løb"
3. Vælg løbstype og format:
   - **Endagsløb**: Monument eller World Cup
   - **Etapeløb**: Tour de France, Giro eller Vuelta

### 5. Registrer resultater

**For endagsløb:**
1. Klik "Registrer Resultat"
2. Vælg rytter, indtast tid og placering

**For etapeløb:**
1. Tilføj etaper først
2. For hver etape: registrer rytter, tid, placering, sprintpoint og bjergpoint
3. Systemet beregner automatisk samlet klassement
4. Tilføj førertrøje bonuspoint under "Førertrøje Bonus"

### 6. Se resultater
- Gå til "Stilling" for at se samlet World Tour point stilling
- Klik på et løb for at se detaljerede resultater

## World Tour Point System (UCI 1997)

Systemet bruger det officielle UCI point system fra 1997:

### Tour de France
- **Samlet klassement**: 130, 104, 88, 68, 48, 28, 8 point
- **Point-/Bjergtrøje**: 21, 15, 11 point
- **Etapesejr**: 21, 15, 11, 9, 7 point
- **Førertrøje bonus**: 8 point per dag

### Giro d'Italia & Vuelta a España
- **Samlet klassement**: 85, 68, 57, 43, 29, 15, 1 point
- **Point-/Bjergtrøje**: 18, 13, 10 point
- **Etapesejr**: 18, 13, 10, 8, 6 point
- **Førertrøje bonus**: 6 point per dag

### Monumenter
80, 64, 52, 44, 36, 28, 20, 12, 4 point

### Store World Cup Løb
50, 40, 33, 28, 23, 18, 13, 8, 3 point

### Øvrige World Cup Løb
40, 32, 26, 22, 18, 14, 10, 6, 2 point

## Backup og Data Sikkerhed 💾

Systemet gemmer automatisk alt data i browserens localStorage, MEN det er vigtigt at lave regelmæssige backups!

### Sådan laver du backup:

1. **Klik på "💾 Backup" knappen** i øverste højre hjørne
2. En JSON fil downloades automatisk til din computer
3. Filen hedder: `cykel-tour-backup-YYYY-MM-DD.json`
4. Gem denne fil et sikkert sted (Dropbox, USB-nøgle, etc.)

### Sådan gendanner du fra backup:

1. **Klik på "📥 Gendan" knappen** i øverste højre hjørne
2. Vælg en af to muligheder:
   - **Erstat Alt Data**: Sletter nuværende data og erstatter med backup
   - **Tilføj Data**: Behold eksisterende data og tilføj fra backup
3. Vælg din backup-fil (.json)
4. Data gendannes og siden genindlæses automatisk

### Vigtigt at vide:

⚠️ **Lav backup regelmæssigt!** Data kan mistes hvis:
- Du sletter browserens cookies/data
- Browseren crasher eller opdateres forkert
- Du skifter computer eller browser

✅ **Anbefalinger:**
- Lav backup efter hver sæson
- Lav backup før store ændringer
- Gem backup-filer flere steder (computer + cloud)
- Del backup-filer mellem spillere for ekstra sikkerhed

### Flyt data mellem computere:

1. Lav backup på Computer A (💾 Backup)
2. Gem JSON filen i Dropbox/Google Drive/USB
3. Download filen på Computer B
4. Import på Computer B (📥 Gendan)

## Tips

- Du kan have flere spil kørende samtidigt
- Skift mellem spil ved at klikke "Skift Spil" i headeren
- Point tælles automatisk til både ryttere og deres hold
- Systemet kan bruges i mange år uden begrænsninger

## Teknisk info

- 100% klientsidt (ingen server nødvendig)
- Vanilla JavaScript (ingen afhængigheder)
- Fungerer offline
- Responsive design - virker på mobil og tablet

God fornøjelse med jeres cykelspil! 🚴‍♂️🏆
