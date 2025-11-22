// Main application
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Homas Tour Pro Starting ===');

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

    // Initialize data
    console.log('Initializing DataManager...');
    DataManager.initData();

    // Initialize UI
    console.log('Initializing UI...');
    UI.init();

    // Check if there's a current game
    const currentGame = DataManager.getCurrentGame();
    console.log('Current game:', currentGame);

    if (currentGame) {
        console.log('Loading game dashboard for:', currentGame.name);
        UI.showGameDashboard();
    } else {
        console.log('No current game, showing home screen');
        UI.showHome();
    }

    console.log('=== Homas Tour Pro Ready ===');
});
