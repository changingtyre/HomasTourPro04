// UI Manager - handles all UI rendering
const UI = {
    mainContent: null,
    currentGameInfo: null,

    init() {
        this.mainContent = document.getElementById('main-content');
        this.currentGameInfo = document.getElementById('current-game-info');
    },

    // Show home screen
    showHome() {
        const data = DataManager.getData();

        let html = '<div class="card">';
        html += '<h2>Velkommen til Homas Tour Pro</h2>';
        html += '<p>Administrer dine cykelløb, hold og ryttere gennem sæsonerne.</p>';
        html += '<div class="home-actions">';
        html += '<button class="btn btn-primary" onclick="UI.showCreateGame()">Opret Nyt Spil</button>';
        html += '</div>';
        html += '</div>';

        if (data.games.length > 0) {
            html += '<div class="card">';
            html += '<h2>Dine Spil</h2>';
            html += '<div class="grid grid-2">';
            data.games.forEach(game => {
                html += `<div class="game-card" onclick="UI.selectGame('${game.id}')">`;
                html += `<h3>${game.name}</h3>`;
                html += `<p>${game.players.length} spillere | ${game.teams.length} hold | ${game.races.length} løb</p>`;
                html += `<small>Oprettet: ${new Date(game.createdDate).toLocaleDateString('da-DK')}</small>`;
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';
        }

        this.mainContent.innerHTML = html;
        this.updateGameInfo();
    },

    // Show create game form
    showCreateGame() {
        let html = '<div class="card">';
        html += '<h2>Opret Nyt Spil</h2>';
        html += '<div class="form-group">';
        html += '<label>Navn på spil (f.eks. "Sæson 2024")</label>';
        html += '<input type="text" id="game-name" placeholder="Sæson 2024">';
        html += '</div>';
        html += '<button class="btn btn-success" onclick="UI.createGame()">Opret Spil</button> ';
        html += '<button class="btn btn-secondary" onclick="UI.showHome()">Annuller</button>';
        html += '</div>';

        this.mainContent.innerHTML = html;
    },

    // Create game
    createGame() {
        const gameName = document.getElementById('game-name').value.trim();
        if (!gameName) {
            alert('Indtast venligst et navn på spillet');
            return;
        }

        DataManager.createGame(gameName);
        this.showGameDashboard();
    },

    // Select and load a game
    selectGame(gameId) {
        DataManager.setCurrentGame(gameId);
        this.showGameDashboard();
    },

    // Show game dashboard
    showGameDashboard() {
        const game = DataManager.getCurrentGame();
        if (!game) {
            this.showHome();
            return;
        }

        let html = '<div class="nav-tabs">';
        html += '<button class="nav-tab active" onclick="UI.showTab(\'overview\', event)">Overblik</button>';
        html += '<button class="nav-tab" onclick="UI.showTab(\'players\', event)">Spillere & Hold</button>';
        html += '<button class="nav-tab" onclick="UI.showTab(\'races\', event)">Løb</button>';
        html += '<button class="nav-tab" onclick="UI.showTab(\'standings\', event)">Resultater</button>';
        html += '</div>';
        html += '<div id="tab-content"></div>';

        this.mainContent.innerHTML = html;
        this.updateGameInfo();
        this.showTab('overview');
    },

    // Show tab content
    showTab(tabName, event) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Only update active tab if event exists (clicked from UI)
        if (event && event.target) {
            event.target.classList.add('active');
        } else {
            // Programmatically called - find and activate the correct tab
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                const onclick = tab.getAttribute('onclick');
                if (onclick && onclick.includes(`'${tabName}'`)) {
                    tab.classList.add('active');
                }
            });
        }

        const tabContent = document.getElementById('tab-content');

        switch(tabName) {
            case 'overview':
                this.showOverviewTab(tabContent);
                break;
            case 'players':
                this.showPlayersTab(tabContent);
                break;
            case 'races':
                this.showRacesTab(tabContent);
                break;
            case 'standings':
                this.showStandingsTab(tabContent);
                break;
        }
    },

    // Overview tab
    showOverviewTab(container) {
        const game = DataManager.getCurrentGame();

        let html = '<div class="card">';
        html += `<h2>${game.name} - Overblik</h2>`;
        html += '<div class="grid grid-3">';
        html += `<div><h3>${game.players.length}</h3><p>Spillere</p></div>`;
        html += `<div><h3>${game.teams.length}</h3><p>Hold</p></div>`;
        html += `<div><h3>${game.races.length}</h3><p>Løb</p></div>`;
        html += '</div>';
        html += '</div>';

        // Quick actions
        html += '<div class="card">';
        html += '<h2>Hurtig Start</h2>';
        html += '<div class="flex gap-10" style="flex-wrap: wrap;">';
        html += '<button class="btn btn-primary" onclick="UI.showAddPlayer()">Tilføj Spiller</button>';
        html += '<button class="btn btn-primary" onclick="UI.showAddTeam()">Tilføj Hold</button>';
        html += '<button class="btn btn-success" onclick="UI.showCreateRace()">Opret Nyt Løb</button>';
        html += '</div>';
        html += '</div>';

        // Recent races
        if (game.races.length > 0) {
            html += '<div class="card">';
            html += '<h2>Seneste Løb</h2>';
            const recentRaces = game.races.slice(-5).reverse();
            html += '<table>';
            html += '<tr><th>Løb</th><th>Vinder</th><th>Dato</th></tr>';
            recentRaces.forEach(race => {
                // Determine winner
                let winner = '-';
                if (race.raceFormat === 'one-day') {
                    const winResult = race.results.find(r => r.position === 1);
                    if (winResult) {
                        const winnerRider = DataManager.getRiderById(winResult.riderId);
                        winner = winnerRider ? winnerRider.name : 'Ukendt';
                    }
                } else {
                    // Stage race - check general classification
                    if (race.generalClassification && race.generalClassification.length > 0) {
                        const gcWinner = race.generalClassification.find(gc => gc.position === 1);
                        if (gcWinner) {
                            const winnerRider = DataManager.getRiderById(gcWinner.riderId);
                            winner = winnerRider ? winnerRider.name : 'Ukendt';
                        }
                    }
                }

                html += '<tr>';
                html += `<td><a href="#" onclick="UI.viewRace('${race.id}'); return false;">${race.name}</a></td>`;
                html += `<td>${winner}</td>`;
                html += `<td>${new Date(race.createdDate).toLocaleDateString('da-DK')}</td>`;
                html += '</tr>';
            });
            html += '</table>';
            html += '</div>';
        }

        container.innerHTML = html;
    },

    // Players tab
    showPlayersTab(container) {
        const game = DataManager.getCurrentGame();
        console.log('showPlayersTab: Current game:', game);
        console.log('showPlayersTab: Number of players:', game.players.length);
        console.log('showPlayersTab: Players array:', game.players);

        let html = '<div class="card">';
        html += '<div class="flex-between mb-20">';
        html += '<h2>Spillere & Hold</h2>';
        html += '<button class="btn btn-primary" onclick="UI.showAddPlayer()">Tilføj Spiller</button>';
        html += '</div>';

        if (game.players.length === 0) {
            html += '<p>Ingen spillere endnu. Opret din første spiller!</p>';
            console.log('showPlayersTab: Showing "no players" message');
        } else {
            console.log('showPlayersTab: Showing', game.players.length, 'players');
            game.players.forEach(player => {
                const playerTeams = game.teams.filter(t => t.playerId === player.id);
                html += '<div class="card" style="margin-bottom: 20px;">';
                html += `<h3>${player.name}</h3>`;

                if (playerTeams.length === 0) {
                    html += '<p>Ingen hold endnu.</p>';
                    html += `<button class="btn btn-primary" onclick="UI.showAddTeam('${player.id}')">Tilføj Hold</button>`;
                } else {
                    playerTeams.forEach(team => {
                        html += `<div style="margin-top: 15px;">`;
                        html += `<div class="flex-between">`;
                        html += `<h4>🚴 ${team.name}</h4>`;
                        html += `<button class="btn btn-secondary" onclick="UI.showAddRider('${team.id}')">Tilføj Rytter</button>`;
                        html += `</div>`;

                        if (team.riders.length > 0) {
                            html += '<table style="margin-top: 10px;">';
                            html += '<tr><th>Rytter</th><th>World Tour Point</th><th>Sejre</th></tr>';
                            team.riders.forEach(rider => {
                                const standing = game.riderStandings.find(r => r.riderId === rider.id) || { worldTourPoints: 0, wins: 0 };
                                html += '<tr>';
                                html += `<td>${rider.name}</td>`;
                                html += `<td>${standing.worldTourPoints}</td>`;
                                html += `<td>${standing.wins}</td>`;
                                html += '</tr>';
                            });
                            html += '</table>';
                        } else {
                            html += '<p style="margin-top: 10px;">Ingen ryttere på holdet endnu.</p>';
                        }
                        html += `</div>`;
                    });
                }
                html += '</div>';
            });
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // Races tab
    showRacesTab(container) {
        const game = DataManager.getCurrentGame();

        let html = '<div class="card">';
        html += '<div class="flex-between mb-20">';
        html += '<h2>Løb</h2>';
        html += '<button class="btn btn-success" onclick="UI.showCreateRace()">Opret Nyt Løb</button>';
        html += '</div>';

        if (game.races.length === 0) {
            html += '<p>Ingen løb endnu. Opret dit første løb!</p>';
        } else {
            html += '<table>';
            html += '<tr><th>Løb</th><th>Vinder</th><th>Dato</th><th>Handling</th></tr>';
            game.races.forEach(race => {
                // Determine winner
                let winner = '-';
                if (race.raceFormat === 'one-day') {
                    const winResult = race.results.find(r => r.position === 1);
                    if (winResult) {
                        const winnerRider = DataManager.getRiderById(winResult.riderId);
                        winner = winnerRider ? winnerRider.name : 'Ukendt';
                    }
                } else {
                    // Stage race - check general classification
                    if (race.generalClassification && race.generalClassification.length > 0) {
                        const gcWinner = race.generalClassification.find(gc => gc.position === 1);
                        if (gcWinner) {
                            const winnerRider = DataManager.getRiderById(gcWinner.riderId);
                            winner = winnerRider ? winnerRider.name : 'Ukendt';
                        }
                    }
                }

                html += '<tr>';
                html += `<td>${race.name}</td>`;
                html += `<td>${winner}</td>`;
                html += `<td>${new Date(race.createdDate).toLocaleDateString('da-DK')}</td>`;
                html += `<td><button class="btn btn-secondary" onclick="UI.viewRace('${race.id}')">Se Løb</button></td>`;
                html += '</tr>';
            });
            html += '</table>';
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // Standings tab
    showStandingsTab(container) {
        const game = DataManager.getCurrentGame();

        let html = '<div class="card">';
        html += '<h2>Rytter Stilling</h2>';

        if (game.riderStandings.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            const sortedRiders = [...game.riderStandings].sort((a, b) => b.worldTourPoints - a.worldTourPoints);
            html += '<table>';
            html += '<tr><th>Position</th><th>Rytter</th><th>Hold</th><th>World Tour Point</th><th>Sejre</th></tr>';
            sortedRiders.forEach((standing, index) => {
                const rider = DataManager.getRiderById(standing.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                html += '<tr>';
                html += `<td>${index + 1}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}</td>`;
                html += `<td>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td><strong>${standing.worldTourPoints}</strong></td>`;
                html += `<td>${standing.wins}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }
        html += '</div>';

        html += '<div class="card mt-20">';
        html += '<h2>Hold Stilling</h2>';

        if (game.teamStandings.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            const sortedTeams = [...game.teamStandings].sort((a, b) => b.worldTourPoints - a.worldTourPoints);
            html += '<table>';
            html += '<tr><th>Position</th><th>Hold</th><th>Spiller</th><th>World Tour Point</th></tr>';
            sortedTeams.forEach((standing, index) => {
                const team = DataManager.getTeamById(standing.teamId);
                const player = team ? DataManager.getPlayerById(team.playerId) : null;
                html += '<tr>';
                html += `<td>${index + 1}</td>`;
                html += `<td>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td>${player ? player.name : 'Ukendt'}</td>`;
                html += `<td><strong>${standing.worldTourPoints}</strong></td>`;
                html += '</tr>';
            });
            html += '</table>';
        }
        html += '</div>';

        container.innerHTML = html;
    },

    // Show add player form
    showAddPlayer() {
        const modal = this.createModal('Tilføj Spiller', `
            <div class="form-group">
                <label>Spillernavn</label>
                <input type="text" id="player-name" placeholder="Indtast navn">
            </div>
            <button class="btn btn-success" onclick="UI.addPlayer()">Tilføj Spiller</button>
        `);
    },

    // Add player
    addPlayer() {
        try {
            const name = document.getElementById('player-name').value.trim();
            if (!name) {
                alert('Indtast venligst et navn');
                return;
            }

            console.log('UI.addPlayer: Adding player:', name);
            const player = DataManager.addPlayer(name);
            console.log('UI.addPlayer: Player added, returned:', player);

            this.closeModal();

            // Small delay to ensure modal is fully closed
            setTimeout(() => {
                console.log('UI.addPlayer: Refreshing dashboard and showing players tab');
                this.showGameDashboard();
                // Automatically switch to players tab to show the new player
                this.showTab('players');
            }, 50);
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Fejl ved tilføjelse af spiller: ' + error.message);
        }
    },

    // Show add team form
    showAddTeam(playerId = null) {
        const game = DataManager.getCurrentGame();

        let playerOptions = '';
        game.players.forEach(player => {
            const selected = player.id === playerId ? 'selected' : '';
            playerOptions += `<option value="${player.id}" ${selected}>${player.name}</option>`;
        });

        const modal = this.createModal('Tilføj Hold', `
            <div class="form-group">
                <label>Holdnavn</label>
                <input type="text" id="team-name" placeholder="Indtast holdnavn">
            </div>
            <div class="form-group">
                <label>Spiller</label>
                <select id="team-player">
                    ${playerOptions}
                </select>
            </div>
            <button class="btn btn-success" onclick="UI.addTeam()">Tilføj Hold</button>
        `);
    },

    // Add team
    addTeam() {
        try {
            const name = document.getElementById('team-name').value.trim();
            const playerId = document.getElementById('team-player').value;

            if (!name) {
                alert('Indtast venligst et holdnavn');
                return;
            }

            DataManager.addTeam(name, playerId);
            this.closeModal();

            // Small delay to ensure modal is fully closed
            setTimeout(() => {
                this.showGameDashboard();
                // Automatically switch to players tab to show the new team
                this.showTab('players');
            }, 50);
        } catch (error) {
            console.error('Error adding team:', error);
            alert('Fejl ved tilføjelse af hold: ' + error.message);
        }
    },

    // Show add rider form
    showAddRider(teamId = null) {
        const game = DataManager.getCurrentGame();

        let teamOptions = '';
        game.teams.forEach(team => {
            const selected = team.id === teamId ? 'selected' : '';
            teamOptions += `<option value="${team.id}" ${selected}>${team.name}</option>`;
        });

        const modal = this.createModal('Tilføj Rytter', `
            <div class="form-group">
                <label>Rytternavn</label>
                <input type="text" id="rider-name" placeholder="Indtast rytternavn">
            </div>
            <div class="form-group">
                <label>Hold</label>
                <select id="rider-team">
                    ${teamOptions}
                </select>
            </div>
            <button class="btn btn-success" onclick="UI.addRider()">Tilføj Rytter</button>
        `);
    },

    // Add rider
    addRider() {
        try {
            const name = document.getElementById('rider-name').value.trim();
            const teamId = document.getElementById('rider-team').value;

            if (!name) {
                alert('Indtast venligst et rytternavn');
                return;
            }

            DataManager.addRider(name, teamId);
            this.closeModal();

            // Small delay to ensure modal is fully closed
            setTimeout(() => {
                this.showGameDashboard();
                // Automatically switch to players tab to show the new rider
                this.showTab('players');
            }, 50);
        } catch (error) {
            console.error('Error adding rider:', error);
            alert('Fejl ved tilføjelse af rytter: ' + error.message);
        }
    },

    // Show create race form
    showCreateRace() {
        const modal = this.createModal('Opret Nyt Løb', `
            <div class="form-group">
                <label>Løbsnavn</label>
                <input type="text" id="race-name" placeholder="f.eks. Tour de France 2024">
            </div>
            <div class="form-group">
                <label>Dato</label>
                <input type="date" id="race-date" required>
            </div>
            <div class="form-group">
                <label>Løbstype</label>
                <select id="race-type">
                    <option value="tour-de-france">Tour de France</option>
                    <option value="giro">Giro d'Italia</option>
                    <option value="vuelta">Vuelta a España</option>
                    <option value="monument">Monument</option>
                    <option value="worldcup-major">World Cup (Major)</option>
                    <option value="worldcup-other">World Cup (Øvrige)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Format</label>
                <select id="race-format">
                    <option value="one-day">Endagsløb</option>
                    <option value="stage">Etapeløb</option>
                </select>
            </div>
            <button class="btn btn-success" onclick="UI.createRace()">Opret Løb</button>
        `);
    },

    // Create race
    createRace() {
        try {
            const name = document.getElementById('race-name').value.trim();
            const date = document.getElementById('race-date').value;
            const type = document.getElementById('race-type').value;
            const format = document.getElementById('race-format').value;

            if (!name) {
                alert('Indtast venligst et løbsnavn');
                return;
            }

            if (!date) {
                alert('Indtast venligst en dato for løbet');
                return;
            }

            const race = DataManager.createRace(name, type, format, date);
            this.closeModal();

            // Small delay to ensure modal is fully closed before navigating
            setTimeout(() => {
                this.viewRace(race.id);
            }, 100);
        } catch (error) {
            console.error('Error creating race:', error);
            alert('Fejl ved oprettelse af løb: ' + error.message);
        }
    },

    // View race details
    viewRace(raceId) {
        try {
            const race = DataManager.getRaceById(raceId);
            if (!race) {
                console.error('Race not found:', raceId);
                alert('Løbet kunne ikke findes!');
                this.showGameDashboard();
                return;
            }

            this.mainContent.innerHTML = `
                <button class="btn btn-secondary mb-20" onclick="UI.showGameDashboard()">← Tilbage til Dashboard</button>
                <div id="race-content"></div>
            `;

            const raceContent = document.getElementById('race-content');

            if (race.raceFormat === 'one-day') {
                this.showOneDayRace(raceContent, race);
            } else {
                this.showStageRace(raceContent, race);
            }
        } catch (error) {
            console.error('Error viewing race:', error);
            alert('Fejl ved visning af løb: ' + error.message);
            this.showGameDashboard();
        }
    },

    // Show one-day race
    showOneDayRace(container, race) {
        let html = '<div class="card">';
        html += `<h2>${race.name}</h2>`;
        html += `<p><strong>Type:</strong> ${PointsCalculator.getRaceTypeName(race.type)}</p>`;
        html += `<p><strong>Format:</strong> Endagsløb</p>`;
        html += `<button class="btn btn-primary mt-20" onclick="UI.showAddOneDayResult('${race.id}')">Registrer Resultat</button>`;
        html += '</div>';

        // Results
        html += '<div class="card">';
        html += '<h2>Resultater</h2>';

        if (race.results.length === 0) {
            html += '<p>Ingen resultater endnu.</p>';
        } else {
            const sortedResults = [...race.results].sort((a, b) => a.position - b.position);
            html += '<table>';
            html += '<tr><th>Placering</th><th>Rytter</th><th>Hold</th><th>Tid</th><th>World Tour Point</th></tr>';
            sortedResults.forEach(result => {
                const rider = DataManager.getRiderById(result.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                const points = PointsCalculator.getOneDayRacePoints(race.type, result.position);
                html += '<tr>';
                html += `<td>${result.position}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}</td>`;
                html += `<td>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td>${result.time}</td>`;
                html += `<td>${points}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }
        html += '</div>';

        container.innerHTML = html;
    },

    // Show stage race
    showStageRace(container, race) {
        let html = '<div class="card">';
        html += `<h2>${race.name}</h2>`;
        html += `<p><strong>Type:</strong> ${PointsCalculator.getRaceTypeName(race.type)}</p>`;
        html += `<p><strong>Format:</strong> Etapeløb</p>`;
        html += '<div class="flex gap-10 mt-20" style="flex-wrap: wrap;">';
        html += `<button class="btn btn-primary" onclick="UI.showAddStage('${race.id}')">Tilføj Etape</button>`;
        html += `<button class="btn btn-secondary" onclick="UI.showYellowJerseyBonus('${race.id}')">Førertrøje Bonus</button>`;
        html += '</div>';
        html += '</div>';

        // Tabs for different views
        html += '<div class="card">';
        html += '<div class="nav-tabs">';
        html += '<button class="nav-tab active" onclick="UI.showRaceTab(\'stages\', \'' + race.id + '\', event)">Etaper</button>';
        html += '<button class="nav-tab" onclick="UI.showRaceTab(\'gc\', \'' + race.id + '\', event)">Samlet Klassement</button>';
        html += '<button class="nav-tab" onclick="UI.showRaceTab(\'points\', \'' + race.id + '\', event)">Pointkonkurrencen</button>';
        html += '<button class="nav-tab" onclick="UI.showRaceTab(\'mountain\', \'' + race.id + '\', event)">Bjergkonkurrencen</button>';
        html += '<button class="nav-tab" onclick="UI.showRaceTab(\'team\', \'' + race.id + '\', event)">Holdkonkurrence</button>';
        html += '</div>';
        html += '<div id="race-tab-content"></div>';
        html += '</div>';

        container.innerHTML = html;
        this.showRaceTab('stages', race.id);
    },

    // Show race tab
    showRaceTab(tabName, raceId, event) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Only update active tab if event exists (clicked from UI)
        if (event && event.target) {
            event.target.classList.add('active');
        } else {
            // Programmatically called - find and activate the correct tab
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                const onclick = tab.getAttribute('onclick');
                if (onclick && onclick.includes(`'${tabName}'`)) {
                    tab.classList.add('active');
                }
            });
        }

        const race = DataManager.getRaceById(raceId);
        const tabContent = document.getElementById('race-tab-content');

        switch(tabName) {
            case 'stages':
                this.showStagesTab(tabContent, race);
                break;
            case 'gc':
                this.showGCTab(tabContent, race);
                break;
            case 'points':
                this.showPointsTab(tabContent, race);
                break;
            case 'mountain':
                this.showMountainTab(tabContent, race);
                break;
            case 'team':
                this.showTeamTab(tabContent, race);
                break;
        }
    },

    // Show stages tab
    showStagesTab(container, race) {
        let html = '';

        if (race.stages.length === 0) {
            html += '<p>Ingen etaper endnu. Tilføj den første etape!</p>';
        } else {
            race.stages.forEach(stage => {
                const stageType = stage.stageType || 'flat';
                html += `<div style="margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">`;
                html += `<div class="flex-between">`;
                html += `<div>`;
                html += `<h3>${stage.name} <span style="font-size: 0.8em; color: #666;">(${PointsCalculator.getStageTypeName(stageType)})</span>`;
                if (stage.finishOnMountain && stage.finishMountainCategory) {
                    html += ` <span style="font-size: 0.8em; color: #c0392b;">🏔️ Slutter på ${PointsCalculator.getMountainCategoryName(stage.finishMountainCategory)}</span>`;
                }
                html += `</h3>`;
                html += `</div>`;
                html += `<div style="display: flex; gap: 8px; flex-wrap: wrap;">`;
                html += `<button class="btn btn-secondary" onclick="UI.showAddMountain('${race.id}', '${stage.id}')">➕ Bjerg</button>`;
                html += `<button class="btn btn-secondary" onclick="UI.showAddSprint('${race.id}', '${stage.id}')">➕ Spurt</button>`;
                html += `<button class="btn btn-primary" onclick="UI.showAddStageResult('${race.id}', '${stage.id}')">Registrer Resultat</button>`;
                html += `</div>`;
                html += `</div>`;

                // Show mountains
                if (stage.mountains && stage.mountains.length > 0) {
                    html += '<div style="margin-top: 15px;"><strong>🏔️ Bjerge:</strong></div>';
                    stage.mountains.forEach(mountain => {
                        html += `<div style="margin-left: 20px; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">`;
                        html += `<div class="flex-between">`;
                        html += `<strong>${mountain.name}</strong> (${PointsCalculator.getMountainCategoryName(mountain.category)})`;
                        html += `<button class="btn btn-secondary" style="font-size: 0.8em; padding: 4px 8px;" onclick="UI.showMountainResults('${race.id}', '${stage.id}', '${mountain.id}')">Registrer</button>`;
                        html += `</div>`;
                        if (mountain.results && mountain.results.length > 0) {
                            html += '<div style="margin-top: 8px; font-size: 0.9em;">';
                            mountain.results.forEach((result, idx) => {
                                const rider = DataManager.getRiderById(result.riderId);
                                const points = PointsCalculator.getMountainPoints(mountain.category, result.position);
                                html += `${idx > 0 ? ', ' : ''}${result.position}. ${rider ? rider.name : '?'} (${points}p)`;
                            });
                            html += '</div>';
                        }
                        html += `</div>`;
                    });
                }

                // Show sprints
                if (stage.sprints && stage.sprints.length > 0) {
                    html += '<div style="margin-top: 15px;"><strong>💨 Spurter:</strong></div>';
                    stage.sprints.forEach(sprint => {
                        html += `<div style="margin-left: 20px; margin-top: 10px; padding: 10px; background: #f0f8ff; border-radius: 4px;">`;
                        html += `<div class="flex-between">`;
                        html += `<strong>${sprint.name}</strong>`;
                        html += `<button class="btn btn-secondary" style="font-size: 0.8em; padding: 4px 8px;" onclick="UI.showSprintResults('${race.id}', '${stage.id}', '${sprint.id}')">Registrer</button>`;
                        html += `</div>`;
                        if (sprint.results && sprint.results.length > 0) {
                            html += '<div style="margin-top: 8px; font-size: 0.9em;">';
                            sprint.results.forEach((result, idx) => {
                                const rider = DataManager.getRiderById(result.riderId);
                                const points = PointsCalculator.getIntermediateSprintPoints(result.position);
                                html += `${idx > 0 ? ', ' : ''}${result.position}. ${rider ? rider.name : '?'} (${points}p)`;
                            });
                            html += '</div>';
                        }
                        html += `</div>`;
                    });
                }

                // Show stage finish results
                html += '<div style="margin-top: 15px;"><strong>🏁 Etape Resultat:</strong></div>';
                if (stage.results && stage.results.length > 0) {
                    const sortedResults = [...stage.results].sort((a, b) => a.position - b.position);
                    html += '<table style="margin-top: 10px; font-size: 0.9em;">';

                    // Add mountain column if stage finishes on mountain
                    if (stage.finishOnMountain && stage.finishMountainCategory) {
                        html += '<tr><th>Pos.</th><th>Rytter</th><th>Tid</th><th>Sprint P.</th><th>Bjerg P.</th><th>Etape WT P.</th></tr>';
                    } else {
                        html += '<tr><th>Pos.</th><th>Rytter</th><th>Tid</th><th>Sprint P.</th><th>Etape WT P.</th></tr>';
                    }

                    sortedResults.forEach(result => {
                        const rider = DataManager.getRiderById(result.riderId);
                        const wtPoints = PointsCalculator.getStagePoints(race.type, result.position);
                        const sprintPoints = PointsCalculator.getStageFinishPoints(stage.stageType || 'flat', result.position);
                        html += '<tr>';
                        html += `<td>${result.position}</td>`;
                        html += `<td>${rider ? rider.name : 'Ukendt'}</td>`;
                        html += `<td>${result.time}</td>`;
                        html += `<td>${sprintPoints}p</td>`;

                        if (stage.finishOnMountain && stage.finishMountainCategory) {
                            const mountainPoints = PointsCalculator.getMountainPoints(stage.finishMountainCategory, result.position);
                            html += `<td>${mountainPoints}p</td>`;
                        }

                        html += `<td>${wtPoints}</td>`;
                        html += '</tr>';
                    });
                    html += '</table>';
                } else {
                    html += '<p style="margin-top: 10px; margin-left: 20px; color: #666;">Ingen resultater endnu.</p>';
                }
                html += `</div>`;
            });
        }

        container.innerHTML = html;
    },

    // Show general classification tab
    showGCTab(container, race) {
        let html = '<h3>Samlet Klassement</h3>';

        if (!race.generalClassification || race.generalClassification.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            html += '<table>';
            html += '<tr><th>Pos.</th><th>Rytter</th><th>Hold</th><th>Samlet Tid</th><th>WT Point</th></tr>';
            race.generalClassification.forEach(gc => {
                const rider = DataManager.getRiderById(gc.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                const points = PointsCalculator.getGCPoints(race.type, gc.position);
                html += '<tr>';
                html += `<td>${gc.position}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}${gc.position === 1 ? ' <span class="badge badge-yellow">Førertrøje</span>' : ''}</td>`;
                html += `<td>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td>${DataManager.formatTime(gc.totalTime)}</td>`;
                html += `<td>${points}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }

        container.innerHTML = html;
    },

    // Show points classification tab
    showPointsTab(container, race) {
        let html = '<h3>Pointkonkurrencen</h3>';

        if (!race.pointsClassification || race.pointsClassification.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            html += '<table>';
            html += '<tr><th>Pos.</th><th>Rytter</th><th>Point</th><th>WT Point</th></tr>';
            race.pointsClassification.forEach(pc => {
                const rider = DataManager.getRiderById(pc.riderId);
                const wtPoints = PointsCalculator.getJerseyPoints(race.type, pc.position, 'points');
                html += '<tr>';
                html += `<td>${pc.position}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}${pc.position === 1 ? ' <span class="badge badge-green">Grøn Trøje</span>' : ''}</td>`;
                html += `<td>${pc.points}</td>`;
                html += `<td>${wtPoints}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }

        container.innerHTML = html;
    },

    // Show mountain classification tab
    showMountainTab(container, race) {
        let html = '<h3>Bjergkonkurrencen</h3>';

        if (!race.mountainClassification || race.mountainClassification.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            html += '<table>';
            html += '<tr><th>Pos.</th><th>Rytter</th><th>Point</th><th>WT Point</th></tr>';
            race.mountainClassification.forEach(mc => {
                const rider = DataManager.getRiderById(mc.riderId);
                const wtPoints = PointsCalculator.getJerseyPoints(race.type, mc.position, 'mountain');
                html += '<tr>';
                html += `<td>${mc.position}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}${mc.position === 1 ? ' <span class="badge badge-polka">Prikkede Trøje</span>' : ''}</td>`;
                html += `<td>${mc.points}</td>`;
                html += `<td>${wtPoints}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }

        container.innerHTML = html;
    },

    // Show team classification tab
    showTeamTab(container, race) {
        let html = '<h3>Holdkonkurrence</h3>';
        html += '<p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Beregnet ud fra de 3 første ryttere fra hvert hold på hver etape.</p>';

        if (!race.teamClassification || race.teamClassification.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            html += '<table>';
            html += '<tr><th>Pos.</th><th>Hold</th><th>Spiller</th><th>Samlet Tid</th></tr>';
            race.teamClassification.forEach(tc => {
                const team = DataManager.getTeamById(tc.teamId);
                const player = team ? DataManager.getPlayerById(team.playerId) : null;
                html += '<tr>';
                html += `<td>${tc.position}</td>`;
                html += `<td>${team ? team.name : 'Ukendt'}${tc.position === 1 ? ' <span class="badge badge-yellow">🏆</span>' : ''}</td>`;
                html += `<td>${player ? player.name : 'Ukendt'}</td>`;
                html += `<td>${DataManager.formatTime(tc.totalTime)}</td>`;
                html += '</tr>';
            });
            html += '</table>';
        }

        container.innerHTML = html;
    },

    // Show add stage form
    showAddStage(raceId) {
        const race = DataManager.getRaceById(raceId);
        const nextStageNumber = race.stages.length + 1;

        this.createModal('Tilføj Etape', `
            <div class="form-group">
                <label>Etapenavn</label>
                <input type="text" id="stage-name" value="Etape ${nextStageNumber}" placeholder="Etape 1">
            </div>
            <div class="form-group">
                <label>Etapenummer</label>
                <input type="number" id="stage-number" value="${nextStageNumber}">
            </div>
            <div class="form-group">
                <label>Etapetype</label>
                <select id="stage-type">
                    <option value="flat">Flad etape</option>
                    <option value="hilly">Kuperet etape</option>
                    <option value="mountain">Bjergetape</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="finish-on-mountain" onchange="document.getElementById('mountain-category-group').style.display = this.checked ? 'block' : 'none'">
                    Etapen slutter på et bjerg
                </label>
            </div>
            <div class="form-group" id="mountain-category-group" style="display: none; margin-left: 20px;">
                <label>Bjergkategori ved mål</label>
                <select id="finish-mountain-category">
                    <option value="cat4">4. kategori (1 point)</option>
                    <option value="cat3">3. kategori (2, 1 point)</option>
                    <option value="cat2">2. kategori (5, 3, 2, 1 point)</option>
                    <option value="cat1">1. kategori (10, 8, 6, 4, 2, 1 point)</option>
                    <option value="hc">Hors Catégorie (20, 15, 12, 10, 8, 6, 4, 2 point)</option>
                </select>
            </div>
            <button class="btn btn-success" onclick="UI.addStage('${raceId}')">Tilføj Etape</button>
        `);
    },

    // Add stage
    addStage(raceId) {
        const name = document.getElementById('stage-name').value.trim();
        const number = parseInt(document.getElementById('stage-number').value);
        const stageType = document.getElementById('stage-type').value;
        const finishOnMountain = document.getElementById('finish-on-mountain').checked;
        const finishMountainCategory = finishOnMountain ? document.getElementById('finish-mountain-category').value : null;

        if (!name) {
            alert('Indtast venligst et etapenavn');
            return;
        }

        DataManager.addStage(raceId, name, number, stageType, finishOnMountain, finishMountainCategory);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add one-day result form (batch mode)
    showAddOneDayResult(raceId) {
        const riders = DataManager.getAllRiders();
        const race = DataManager.getRaceById(raceId);

        // Create rider options for dropdowns
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Build map of existing results by position
        const resultsByPosition = {};
        race.results.forEach(result => {
            resultsByPosition[result.position] = result;
        });

        // Create rows for each position (1 to number of riders)
        let tableRows = '';
        for (let position = 1; position <= riders.length; position++) {
            const existingResult = resultsByPosition[position];
            tableRows += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                        ${existingResult ? `<script>document.getElementById('rider-${position}').value = '${existingResult.riderId}';</script>` : ''}
                    </td>
                    <td>
                        <input type="text"
                               id="time-${position}"
                               value="${existingResult ? existingResult.time : ''}"
                               placeholder="4:23:15"
                               style="width: 100%; padding: 5px;">
                    </td>
                </tr>
            `;
        }

        this.createModal('Registrer Resultater', `
            <p style="margin-bottom: 15px;">Vælg rytter og tid for hver placering. Tom rytter = ingen på den placering.</p>
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%;">
                    <thead>
                        <tr style="position: sticky; top: 0; background: white;">
                            <th style="text-align: center; padding: 8px; width: 60px;">Plac.</th>
                            <th style="text-align: left; padding: 8px;">Rytter</th>
                            <th style="text-align: left; padding: 8px; width: 120px;">Tid</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="UI.saveBatchOneDayResults('${raceId}')">Gem Alle Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= riders.length; position++) {
                const existingResult = resultsByPosition[position];
                if (existingResult) {
                    const select = document.getElementById(`rider-${position}`);
                    if (select) select.value = existingResult.riderId;
                }
            }
        });
    },

    // Save batch one-day results
    saveBatchOneDayResults(raceId) {
        const riders = DataManager.getAllRiders();
        const results = [];

        // Loop through positions instead of riders
        for (let position = 1; position <= riders.length; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const timeInput = document.getElementById(`time-${position}`);

            const riderId = riderSelect ? riderSelect.value : '';
            const time = timeInput ? timeInput.value.trim() : '';

            // Only add if both rider and time are provided
            if (riderId && time) {
                results.push({
                    riderId: riderId,
                    time: time,
                    position: position
                });
            }
        }

        if (results.length === 0) {
            alert('Indtast venligst mindst ét resultat');
            return;
        }

        DataManager.addBatchOneDayResults(raceId, results);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add stage result form (batch mode)
    showAddStageResult(raceId, stageId) {
        const riders = DataManager.getAllRiders();
        const race = DataManager.getRaceById(raceId);
        const stage = race.stages.find(s => s.id === stageId);
        const stageType = stage.stageType || 'flat';

        // Create rider options for dropdowns
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Build map of existing results by position
        const resultsByPosition = {};
        if (stage.results) {
            stage.results.forEach(result => {
                resultsByPosition[result.position] = result;
            });
        }

        // Create rows for each position
        let tableRows = '';
        for (let position = 1; position <= riders.length; position++) {
            const existingResult = resultsByPosition[position];
            const finishPoints = PointsCalculator.getStageFinishPoints(stageType, position);
            tableRows += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                    </td>
                    <td>
                        <input type="text"
                               id="time-${position}"
                               value="${existingResult ? existingResult.time : ''}"
                               placeholder="4:23:15"
                               style="width: 100%; padding: 5px;">
                    </td>
                    <td style="text-align: center;">${finishPoints}p</td>
                </tr>
            `;
        }

        this.createModal('Registrer Etape Målgang', `
            <p style="margin-bottom: 10px;"><strong>Etapetype:</strong> ${PointsCalculator.getStageTypeName(stageType)}</p>
            <p style="margin-bottom: 15px; font-size: 0.9em; color: #666;">Vælg rytter og tid for hver placering. Sprint- og bjergpoint registreres separat.</p>
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%;">
                    <thead>
                        <tr style="position: sticky; top: 0; background: white;">
                            <th style="text-align: center; padding: 8px; width: 60px;">Plac.</th>
                            <th style="text-align: left; padding: 8px;">Rytter</th>
                            <th style="text-align: left; padding: 8px; width: 120px;">Tid</th>
                            <th style="text-align: center; padding: 8px; width: 80px;">Sprint P.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="UI.saveBatchStageResults('${raceId}', '${stageId}')">Gem Alle Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= riders.length; position++) {
                const existingResult = resultsByPosition[position];
                if (existingResult) {
                    const select = document.getElementById(`rider-${position}`);
                    if (select) select.value = existingResult.riderId;
                }
            }
        });
    },

    // Save batch stage results
    saveBatchStageResults(raceId, stageId) {
        const riders = DataManager.getAllRiders();
        const results = [];

        // Loop through positions instead of riders
        for (let position = 1; position <= riders.length; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const timeInput = document.getElementById(`time-${position}`);

            const riderId = riderSelect ? riderSelect.value : '';
            const time = timeInput ? timeInput.value.trim() : '';

            // Only add if both rider and time are provided
            if (riderId && time) {
                results.push({
                    riderId: riderId,
                    time: time,
                    position: position
                });
            }
        }

        if (results.length === 0) {
            alert('Indtast venligst mindst ét resultat');
            return;
        }

        DataManager.addBatchStageResults(raceId, stageId, results);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add mountain form
    showAddMountain(raceId, stageId) {
        console.log('showAddMountain called with:', raceId, stageId);
        this.createModal('Tilføj Bjerg', `
            <div class="form-group">
                <label>Bjergnavn</label>
                <input type="text" id="mountain-name" placeholder="f.eks. Col du Tourmalet">
            </div>
            <div class="form-group">
                <label>Kategori</label>
                <select id="mountain-category">
                    <option value="cat4">4. kategori (1 point)</option>
                    <option value="cat3">3. kategori (2, 1 point)</option>
                    <option value="cat2">2. kategori (5, 3, 2, 1 point)</option>
                    <option value="cat1">1. kategori (10, 8, 6, 4, 2, 1 point)</option>
                    <option value="hc">Hors Catégorie (20, 15, 12, 10, 8, 6, 4, 2 point)</option>
                </select>
            </div>
            <button class="btn btn-success" onclick="UI.addMountain('${raceId}', '${stageId}')">Tilføj Bjerg</button>
        `);
    },

    // Add mountain
    addMountain(raceId, stageId) {
        const name = document.getElementById('mountain-name').value.trim();
        const category = document.getElementById('mountain-category').value;

        if (!name) {
            alert('Indtast venligst et bjergnavn');
            return;
        }

        DataManager.addMountain(raceId, stageId, name, category);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add sprint form
    showAddSprint(raceId, stageId) {
        console.log('showAddSprint called with:', raceId, stageId);
        this.createModal('Tilføj Mellemspurt', `
            <div class="form-group">
                <label>Spurtnavn</label>
                <input type="text" id="sprint-name" placeholder="f.eks. Mellemspurt km 45">
            </div>
            <button class="btn btn-success" onclick="UI.addSprint('${raceId}', '${stageId}')">Tilføj Spurt</button>
        `);
    },

    // Add sprint
    addSprint(raceId, stageId) {
        const name = document.getElementById('sprint-name').value.trim();

        if (!name) {
            alert('Indtast venligst et spurtnavn');
            return;
        }

        DataManager.addSprint(raceId, stageId, name);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show mountain results form
    showMountainResults(raceId, stageId, mountainId) {
        const riders = DataManager.getAllRiders();
        const race = DataManager.getRaceById(raceId);
        const stage = race.stages.find(s => s.id === stageId);
        const mountain = stage.mountains.find(m => m.id === mountainId);

        // Get max positions based on category
        let maxPositions;
        switch(mountain.category) {
            case 'cat4': maxPositions = 1; break;
            case 'cat3': maxPositions = 2; break;
            case 'cat2': maxPositions = 4; break;
            case 'cat1': maxPositions = 6; break;
            case 'hc': maxPositions = 8; break;
            default: maxPositions = 8;
        }

        // Create rider options
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Build map of existing results by position
        const resultsByPosition = {};
        if (mountain.results) {
            mountain.results.forEach(result => {
                resultsByPosition[result.position] = result;
            });
        }

        // Create rows for each position
        let tableRows = '';
        for (let position = 1; position <= maxPositions; position++) {
            const existingResult = resultsByPosition[position];
            const points = PointsCalculator.getMountainPoints(mountain.category, position);
            tableRows += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                    </td>
                    <td style="text-align: center;">${points} point</td>
                </tr>
            `;
        }

        this.createModal(`${mountain.name} - Resultater`, `
            <p style="margin-bottom: 15px;"><strong>Kategori:</strong> ${PointsCalculator.getMountainCategoryName(mountain.category)}</p>
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%;">
                    <thead>
                        <tr style="position: sticky; top: 0; background: white;">
                            <th style="text-align: center; padding: 8px; width: 60px;">Plac.</th>
                            <th style="text-align: left; padding: 8px;">Rytter</th>
                            <th style="text-align: center; padding: 8px; width: 100px;">Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="UI.saveMountainResults('${raceId}', '${stageId}', '${mountainId}')">Gem Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= maxPositions; position++) {
                const existingResult = resultsByPosition[position];
                if (existingResult) {
                    const select = document.getElementById(`rider-${position}`);
                    if (select) select.value = existingResult.riderId;
                }
            }
        });
    },

    // Save mountain results
    saveMountainResults(raceId, stageId, mountainId) {
        const race = DataManager.getRaceById(raceId);
        const stage = race.stages.find(s => s.id === stageId);
        const mountain = stage.mountains.find(m => m.id === mountainId);

        let maxPositions;
        switch(mountain.category) {
            case 'cat4': maxPositions = 1; break;
            case 'cat3': maxPositions = 2; break;
            case 'cat2': maxPositions = 4; break;
            case 'cat1': maxPositions = 6; break;
            case 'hc': maxPositions = 8; break;
            default: maxPositions = 8;
        }

        const results = [];
        for (let position = 1; position <= maxPositions; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const riderId = riderSelect ? riderSelect.value : '';

            if (riderId) {
                results.push({
                    riderId: riderId,
                    position: position
                });
            }
        }

        DataManager.addMountainResults(raceId, stageId, mountainId, results);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show sprint results form
    showSprintResults(raceId, stageId, sprintId) {
        const riders = DataManager.getAllRiders();
        const race = DataManager.getRaceById(raceId);
        const stage = race.stages.find(s => s.id === stageId);
        const sprint = stage.sprints.find(s => s.id === sprintId);

        const maxPositions = 15; // Intermediate sprints give points to top 15

        // Create rider options
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Build map of existing results by position
        const resultsByPosition = {};
        if (sprint.results) {
            sprint.results.forEach(result => {
                resultsByPosition[result.position] = result;
            });
        }

        // Create rows for each position
        let tableRows = '';
        for (let position = 1; position <= maxPositions; position++) {
            const existingResult = resultsByPosition[position];
            const points = PointsCalculator.getIntermediateSprintPoints(position);
            tableRows += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                    </td>
                    <td style="text-align: center;">${points} point</td>
                </tr>
            `;
        }

        this.createModal(`${sprint.name} - Resultater`, `
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; font-size: 0.9em;">
                    <thead>
                        <tr style="position: sticky; top: 0; background: white;">
                            <th style="text-align: center; padding: 8px; width: 50px;">Plac.</th>
                            <th style="text-align: left; padding: 8px;">Rytter</th>
                            <th style="text-align: center; padding: 8px; width: 80px;">Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="UI.saveSprintResults('${raceId}', '${stageId}', '${sprintId}')">Gem Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= maxPositions; position++) {
                const existingResult = resultsByPosition[position];
                if (existingResult) {
                    const select = document.getElementById(`rider-${position}`);
                    if (select) select.value = existingResult.riderId;
                }
            }
        });
    },

    // Save sprint results
    saveSprintResults(raceId, stageId, sprintId) {
        const maxPositions = 15;
        const results = [];

        for (let position = 1; position <= maxPositions; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const riderId = riderSelect ? riderSelect.value : '';

            if (riderId) {
                results.push({
                    riderId: riderId,
                    position: position
                });
            }
        }

        DataManager.addSprintResults(raceId, stageId, sprintId, results);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show yellow jersey bonus form
    showYellowJerseyBonus(raceId) {
        const race = DataManager.getRaceById(raceId);
        const riders = DataManager.getAllRiders();

        let html = '<p>Indtast antal dage hver rytter har haft førertrøjen:</p>';
        riders.forEach(rider => {
            const currentDays = race.yellowJerseyDays[rider.id] || 0;
            html += `<div class="form-group">`;
            html += `<label>${rider.name}</label>`;
            html += `<input type="number" id="jersey-${rider.id}" min="0" value="${currentDays}">`;
            html += `</div>`;
        });
        html += `<button class="btn btn-success" onclick="UI.saveYellowJerseyBonus('${raceId}')">Gem</button>`;

        this.createModal('Førertrøje Bonuspoint', html);
    },

    // Save yellow jersey bonus
    saveYellowJerseyBonus(raceId) {
        const riders = DataManager.getAllRiders();

        riders.forEach(rider => {
            const input = document.getElementById(`jersey-${rider.id}`);
            if (input) {
                const days = parseInt(input.value) || 0;
                if (days > 0) {
                    DataManager.setYellowJerseyDays(raceId, rider.id, days);
                }
            }
        });

        this.closeModal();
        this.viewRace(raceId);
    },

    // Create modal
    createModal(title, content, callback) {
        // Close any existing modals first
        this.closeModal();

        const modalHtml = `
            <div id="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>${title}</h2>
                        <button onclick="UI.closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    ${content}
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Call callback after modal is added to DOM
        if (callback && typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.parentElement.remove();
        }
    },

    // Update game info in header
    updateGameInfo() {
        const game = DataManager.getCurrentGame();
        if (game) {
            this.currentGameInfo.innerHTML = `Nuværende Spil: <strong>${game.name}</strong> | <a href="#" onclick="UI.showHome(); return false;" style="color: white;">Skift Spil</a>`;
        } else {
            this.currentGameInfo.innerHTML = '';
        }
    },

    // Export data (download backup)
    exportData() {
        try {
            DataManager.exportData();
            this.showNotification('✅ Backup gemt! Filen er downloadet til din computer.', 'success');
        } catch (error) {
            alert('Fejl ved eksport: ' + error.message);
        }
    },

    // Show import dialog
    showImportDialog() {
        const options = `
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 15px;">Vælg hvordan du vil importere data:</p>
                <button class="btn btn-danger" onclick="UI.triggerImport('replace')" style="width: 100%; margin-bottom: 10px;">
                    🔄 Erstat Alt Data
                    <br><small style="opacity: 0.8;">Sletter nuværende data og erstatter med backup</small>
                </button>
                <button class="btn btn-primary" onclick="UI.triggerImport('merge')" style="width: 100%;">
                    ➕ Tilføj Data
                    <br><small style="opacity: 0.8;">Behold eksisterende data og tilføj fra backup</small>
                </button>
            </div>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `;

        this.createModal('Importer Backup', options);
    },

    // Trigger file input
    triggerImport(mode) {
        this.closeModal();
        const fileInput = document.getElementById('import-file-input');
        fileInput.dataset.mode = mode;
        fileInput.click();
    },

    // Handle import
    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const mode = event.target.dataset.mode || 'replace';

        try {
            if (mode === 'replace') {
                await DataManager.importData(file);
                this.showNotification('✅ Data importeret! Siden genindlæses...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else if (mode === 'merge') {
                await DataManager.mergeImportData(file);
                this.showNotification('✅ Data tilføjet! Siden genindlæses...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            alert('Fejl ved import: ' + error.message);
        }

        // Reset file input
        event.target.value = '';
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};
