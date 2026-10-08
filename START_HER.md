# 🚴 Sådan starter du Homas Tour Pro

## ⚠️ VIGTIGT: Kør via webserver!

**Du SKAL åbne systemet via en webserver** - ikke bare dobbeltklik på index.html!

### Hvorfor?
Browsere blokerer localStorage når du åbner HTML filer direkte (file://) af sikkerhedsgrunde.
Dette betyder at dine data IKKE kan gemmes.

---

## 🟢 Metode 1: Python (Anbefalet - Nemmest)

### Windows:
1. Åbn **Kommandoprompt** (cmd) eller **PowerShell**
2. Naviger til mappen:
   ```
   cd sti\til\HomasTourPro04
   ```
3. Start webserver:
   ```
   python -m http.server 8000
   ```
4. Åbn browseren og gå til: **http://localhost:8000**

### Mac/Linux:
1. Åbn **Terminal**
2. Naviger til mappen:
   ```
   cd /sti/til/HomasTourPro04
   ```
3. Start webserver:
   ```
   python3 -m http.server 8000
   ```
4. Åbn browseren og gå til: **http://localhost:8000**

---

## 🔵 Metode 2: VS Code Live Server

Hvis du bruger VS Code:

1. Installer **Live Server** extension
2. Højreklik på `index.html`
3. Vælg "Open with Live Server"
4. Systemet åbner automatisk i browseren

---

## 🟡 Metode 3: Node.js http-server

Hvis du har Node.js installeret:

1. Installer http-server globalt:
   ```
   npm install -g http-server
   ```
2. Kør i mappen:
   ```
   http-server
   ```
3. Åbn browseren og gå til: **http://localhost:8080**

---

## ✅ Test at det virker

Når du har åbnet systemet via en webserver:

1. Tryk **F12** for at åbne Developer Console
2. Se efter denne besked: `✅ localStorage is working`
3. Hvis du ser `❌ localStorage NOT available` - bruger du IKKE en webserver!

---

## 🐛 Fejlfinding

### Problem: "localStorage virker ikke"
**Løsning:** Du har åbnet filen direkte. Brug en af metoderne ovenfor.

### Problem: "python er ikke genkendt som en kommando"
**Løsning:**
- **Windows:** Installer Python fra python.org (husk at tjekke "Add to PATH")
- **Mac:** Python3 er forudinstalleret

### Problem: Port 8000 er optaget
**Løsning:** Brug en anden port:
```
python -m http.server 8001
```
Åbn derefter http://localhost:8001

---

## 📞 Har du stadig problemer?

Åbn Developer Console (F12) og se efter fejlbeskeder.
Del screenshots af console output hvis du har brug for hjælp.

**God fornøjelse med Homas Tour Pro!** 🚴‍♂️🏆
