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
        html += '<button class="nav-tab" onclick="UI.showTab(\'standings\', event)">Stilling</button>';
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
            html += '<tr><th>Løb</th><th>Type</th><th>Format</th><th>Dato</th></tr>';
            recentRaces.forEach(race => {
                html += '<tr>';
                html += `<td><a href="#" onclick="UI.viewRace('${race.id}'); return false;">${race.name}</a></td>`;
                html += `<td>${PointsCalculator.getRaceTypeName(race.type)}</td>`;
                html += `<td>${race.raceFormat === 'one-day' ? 'Endagsløb' : 'Etapeløb'}</td>`;
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
            html += '<tr><th>Løb</th><th>Type</th><th>Format</th><th>Dato</th><th>Handling</th></tr>';
            game.races.forEach(race => {
                html += '<tr>';
                html += `<td>${race.name}</td>`;
                html += `<td>${PointsCalculator.getRaceTypeName(race.type)}</td>`;
                html += `<td>${race.raceFormat === 'one-day' ? 'Endagsløb' : 'Etapeløb'}</td>`;
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
            const type = document.getElementById('race-type').value;
            const format = document.getElementById('race-format').value;

            if (!name) {
                alert('Indtast venligst et løbsnavn');
                return;
            }

            const race = DataManager.createRace(name, type, format);
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
        }
    },

    // Show stages tab
    showStagesTab(container, race) {
        let html = '';

        if (race.stages.length === 0) {
            html += '<p>Ingen etaper endnu. Tilføj den første etape!</p>';
        } else {
            race.stages.forEach(stage => {
                html += `<div style="margin-bottom: 30px;">`;
                html += `<div class="flex-between">`;
                html += `<h3>${stage.name}</h3>`;
                html += `<button class="btn btn-secondary" onclick="UI.showAddStageResult('${race.id}', '${stage.id}')">Registrer Resultat</button>`;
                html += `</div>`;

                if (stage.results.length > 0) {
                    const sortedResults = [...stage.results].sort((a, b) => a.position - b.position);
                    html += '<table style="margin-top: 10px;">';
                    html += '<tr><th>Pos.</th><th>Rytter</th><th>Tid</th><th>Sprint P.</th><th>Bjerg P.</th><th>WT Point</th></tr>';
                    sortedResults.forEach(result => {
                        const rider = DataManager.getRiderById(result.riderId);
                        const points = PointsCalculator.getStagePoints(race.type, result.position);
                        html += '<tr>';
                        html += `<td>${result.position}</td>`;
                        html += `<td>${rider ? rider.name : 'Ukendt'}</td>`;
                        html += `<td>${result.time}</td>`;
                        html += `<td>${result.sprintPoints || 0}</td>`;
                        html += `<td>${result.mountainPoints || 0}</td>`;
                        html += `<td>${points}</td>`;
                        html += '</tr>';
                    });
                    html += '</table>';
                } else {
                    html += '<p style="margin-top: 10px;">Ingen resultater endnu.</p>';
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
            <button class="btn btn-success" onclick="UI.addStage('${raceId}')">Tilføj Etape</button>
        `);
    },

    // Add stage
    addStage(raceId) {
        const name = document.getElementById('stage-name').value.trim();
        const number = parseInt(document.getElementById('stage-number').value);

        if (!name) {
            alert('Indtast venligst et etapenavn');
            return;
        }

        DataManager.addStage(raceId, name, number);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add one-day result form
    showAddOneDayResult(raceId) {
        const riders = DataManager.getAllRiders();

        let riderOptions = '';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        this.createModal('Registrer Resultat', `
            <div class="form-group">
                <label>Rytter</label>
                <select id="result-rider">
                    ${riderOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Tid (MM:SS eller HH:MM:SS)</label>
                <input type="text" id="result-time" placeholder="4:23:15">
            </div>
            <div class="form-group">
                <label>Placering</label>
                <input type="number" id="result-position" min="1" value="1">
            </div>
            <button class="btn btn-success" onclick="UI.addOneDayResult('${raceId}')">Gem Resultat</button>
        `);
    },

    // Add one-day result
    addOneDayResult(raceId) {
        const riderId = document.getElementById('result-rider').value;
        const time = document.getElementById('result-time').value.trim();
        const position = parseInt(document.getElementById('result-position').value);

        if (!time) {
            alert('Indtast venligst en tid');
            return;
        }

        DataManager.addOneDayResult(raceId, riderId, time, position);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Show add stage result form
    showAddStageResult(raceId, stageId) {
        const riders = DataManager.getAllRiders();

        let riderOptions = '';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        this.createModal('Registrer Etape Resultat', `
            <div class="form-group">
                <label>Rytter</label>
                <select id="result-rider">
                    ${riderOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Tid (MM:SS eller HH:MM:SS)</label>
                <input type="text" id="result-time" placeholder="4:23:15">
            </div>
            <div class="form-group">
                <label>Placering</label>
                <input type="number" id="result-position" min="1" value="1">
            </div>
            <div class="form-group">
                <label>Sprintpoint</label>
                <input type="number" id="result-sprint" min="0" value="0">
            </div>
            <div class="form-group">
                <label>Bjergpoint</label>
                <input type="number" id="result-mountain" min="0" value="0">
            </div>
            <button class="btn btn-success" onclick="UI.addStageResult('${raceId}', '${stageId}')">Gem Resultat</button>
        `);
    },

    // Add stage result
    addStageResult(raceId, stageId) {
        const riderId = document.getElementById('result-rider').value;
        const time = document.getElementById('result-time').value.trim();
        const position = parseInt(document.getElementById('result-position').value);
        const sprintPoints = parseInt(document.getElementById('result-sprint').value);
        const mountainPoints = parseInt(document.getElementById('result-mountain').value);

        if (!time) {
            alert('Indtast venligst en tid');
            return;
        }

        DataManager.addStageResult(raceId, stageId, riderId, time, position, sprintPoints, mountainPoints);
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
    createModal(title, content) {
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
