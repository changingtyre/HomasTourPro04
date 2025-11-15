// Main application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    DataManager.initData();

    // Initialize UI
    UI.init();

    // Check if there's a current game
    const currentGame = DataManager.getCurrentGame();
    if (currentGame) {
        UI.showGameDashboard();
    } else {
        UI.showHome();
    }
});
