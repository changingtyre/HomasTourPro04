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

## Data og backup

- Alt data gemmes automatisk i browserens localStorage
- For at lave backup: Brug browser dev tools (F12) → Application/Storage → Local Storage → kopier data
- For at nulstille: Slet localStorage data i dev tools

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
