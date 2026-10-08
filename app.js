// Main application

// Redigering kun lokalt; alle andre værter får en skrivebeskyttet visning af data.json
function isEditHost() {
    const host = location.hostname;
    return location.protocol === 'file:' ||
           host === 'localhost' ||
           host === '127.0.0.1' ||
           host.endsWith('.github.dev');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Homas Tour Pro Starting ===');

    if (!isEditHost()) {
        DataManager.readOnly = true;
        document.body.classList.add('readonly');

        try {
            await DataManager.loadReadOnlyData();
        } catch (error) {
            console.error('❌ Kunne ikke hente data.json:', error);
            document.getElementById('main-content').innerHTML =
                '<div class="card"><h2>Ingen data</h2><p>Resultaterne kunne ikke indlæses. Prøv igen senere.</p></div>';
            return;
        }
    } else {
        // Test localStorage availability
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            const testValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            if (testValue !== 'test') {
                throw new Error('localStorage read/write test failed');
            }

            console.log('✅ localStorage is working');
        } catch (error) {
            console.error('❌ localStorage NOT available:', error);
            alert('ADVARSEL: localStorage virker ikke!\n\n' +
                  'Dette sker normalt når du åbner filen direkt (file://).\n\n' +
                  'Løsning:\n' +
                  '1. Installer Python (hvis ikke installeret)\n' +
                  '2. Åbn terminal/kommandoprompt i mappen\n' +
                  '3. Kør: python -m http.server 8000\n' +
                  '4. Åbn http://localhost:8000 i browseren\n\n' +
                  'Alternativt: Brug VS Code Live Server extension');
        }
    }

    // Initialize data
    console.log('Initializing DataManager...');
    DataManager.initData();

    // Tag already-completed stage races before any recalculation so they keep
    // the old top-15 sprint points distribution.
    DataManager.migrateLegacySprintPoints();

    // Initialize UI
    console.log('Initializing UI...');
    UI.init();

    // Check if there's a current game
    const currentGame = DataManager.getCurrentGame();
    console.log('Current game:', currentGame);

    if (currentGame) {
        console.log('Loading game dashboard for:', currentGame.name);

        // Recalculate all world tour points to fix any old data
        console.log('Recalculating all world tour points...');
        DataManager.recalculateAllRaces();

        UI.showGameDashboard();
    } else {
        console.log('No current game, showing home screen');
        UI.showHome();
    }

    console.log('=== Homas Tour Pro Ready ===');
});
