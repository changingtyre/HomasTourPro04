// UI Manager - handles all UI rendering
const UI = {
    mainContent: null,
    currentGameInfo: null,
    sortState: {
        riderStandings: { column: 'points', direction: 'desc' },
        teamStandings: { column: 'points', direction: 'desc' }
    },

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
                html += `<div class="game-card" onclick="UI.selectGame('${game.id}')" style="position: relative; cursor: pointer;">`;
                html += `<h3>${game.name}</h3>`;
                html += `<p>${game.players.length} spillere | ${game.teams.length} hold | ${game.races.length} løb</p>`;
                html += `<small>Oprettet: ${new Date(game.createdDate).toLocaleDateString('da-DK')}</small>`;
                html += `<button class="btn btn-danger" onclick="event.stopPropagation(); UI.confirmDeleteGame('${game.id}', '${game.name.replace(/'/g, "\\'")}');" style="position: absolute; top: 10px; right: 10px; padding: 5px 10px; font-size: 0.8em;">🗑️ Slet</button>`;
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

    // Confirm delete game
    confirmDeleteGame(gameId, gameName) {
        if (confirm(`Er du sikker på at du vil slette spillet "${gameName}"?\n\nDette vil slette ALLE spillere, hold, ryttere, løb og resultater.\n\nDette kan IKKE fortrydes!`)) {
            DataManager.deleteGame(gameId);
            this.showHome();
        }
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
        html += '<button class="nav-tab" onclick="UI.showTab(\'statistics\', event)">Statistik</button>';
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
            case 'statistics':
                this.showStatisticsTab(tabContent);
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

        // Add search box
        html += '<div class="form-group" style="margin-bottom: 20px;">';
        html += '<input type="text" id="search-players" placeholder="Søg efter spillere, hold eller ryttere..." oninput="UI.filterPlayers()" style="width: 100%; padding: 10px;">';
        html += '</div>';

        html += '<div id="players-list">';

        if (game.players.length === 0) {
            html += '<p>Ingen spillere endnu. Opret din første spiller!</p>';
            console.log('showPlayersTab: Showing "no players" message');
        } else {
            console.log('showPlayersTab: Showing', game.players.length, 'players');
            game.players.forEach(player => {
                const playerTeams = game.teams.filter(t => t.playerId === player.id);
                html += '<div class="card" style="margin-bottom: 20px;">';
                html += `<div class="flex-between" style="align-items: center;">`;
                html += `<h3>${player.name}</h3>`;
                html += `<div>`;
                html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showEditPlayer('${player.id}', '${player.name.replace(/'/g, "\\'")}')">✏️ Rediger</button>`;
                html += `<button class="btn btn-danger" onclick="UI.confirmDeletePlayer('${player.id}', '${player.name.replace(/'/g, "\\'")}')">🗑️ Slet</button>`;
                html += `</div>`;
                html += `</div>`;

                if (playerTeams.length === 0) {
                    html += '<p>Ingen hold endnu.</p>';
                    html += `<button class="btn btn-primary" onclick="UI.showAddTeam('${player.id}')">Tilføj Hold</button>`;
                } else {
                    playerTeams.forEach(team => {
                        html += `<div style="margin-top: 15px;">`;
                        html += `<div class="flex-between">`;
                        html += `<h4>🚴 ${team.name}</h4>`;
                        html += `<div>`;
                        html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showAddRider('${team.id}')">Tilføj Rytter</button>`;
                        html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showEditTeam('${team.id}', '${team.name.replace(/'/g, "\\'")}')">✏️ Rediger</button>`;
                        html += `<button class="btn btn-danger" onclick="UI.confirmDeleteTeam('${team.id}', '${team.name.replace(/'/g, "\\'")}')">🗑️ Slet</button>`;
                        html += `</div>`;
                        html += `</div>`;

                        if (team.riders.length > 0) {
                            html += '<table style="margin-top: 10px;">';
                            html += '<tr><th>Rytter</th><th>World Tour Point</th><th>Sejre</th><th>Handlinger</th></tr>';
                            team.riders.forEach(rider => {
                                const standing = game.riderStandings.find(r => r.riderId === rider.id) || { worldTourPoints: 0, wins: 0 };
                                html += '<tr>';
                                html += `<td>${rider.name}</td>`;
                                html += `<td>${standing.worldTourPoints}</td>`;
                                html += `<td>${standing.wins}</td>`;
                                html += `<td>`;
                                html += `<button class="btn btn-secondary" style="margin-right: 5px; font-size: 0.8em; padding: 4px 8px;" onclick="UI.showEditRider('${rider.id}', '${rider.name.replace(/'/g, "\\'")}')">✏️</button>`;
                                html += `<button class="btn btn-danger" style="font-size: 0.8em; padding: 4px 8px;" onclick="UI.confirmDeleteRider('${rider.id}', '${rider.name.replace(/'/g, "\\'")}')">🗑️</button>`;
                                html += `</td>`;
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

        html += '</div>'; // Close players-list
        html += '</div>'; // Close card
        container.innerHTML = html;
    },

    // Filter players by search term
    filterPlayers() {
        const searchTerm = document.getElementById('search-players').value.toLowerCase();
        const playersList = document.getElementById('players-list');
        const game = DataManager.getCurrentGame();

        if (!game || !playersList) return;

        let html = '';

        if (game.players.length === 0) {
            html += '<p>Ingen spillere endnu. Opret din første spiller!</p>';
        } else {
            game.players.forEach(player => {
                const playerTeams = game.teams.filter(t => t.playerId === player.id);

                // Check if player, team or rider matches search
                const playerMatches = player.name.toLowerCase().includes(searchTerm);
                const teamMatches = playerTeams.some(t => t.name.toLowerCase().includes(searchTerm));
                const riderMatches = playerTeams.some(t =>
                    t.riders.some(r => r.name.toLowerCase().includes(searchTerm))
                );

                if (searchTerm === '' || playerMatches || teamMatches || riderMatches) {
                    html += '<div class="card" style="margin-bottom: 20px;">';
                    html += `<div class="flex-between" style="align-items: center;">`;
                    html += `<h3>${player.name}</h3>`;
                    html += `<div>`;
                    html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showEditPlayer('${player.id}', '${player.name.replace(/'/g, "\\'")}')">✏️ Rediger</button>`;
                    html += `<button class="btn btn-danger" onclick="UI.confirmDeletePlayer('${player.id}', '${player.name.replace(/'/g, "\\'")}')">🗑️ Slet</button>`;
                    html += `</div>`;
                    html += `</div>`;

                    if (playerTeams.length === 0) {
                        html += '<p>Ingen hold endnu.</p>';
                        html += `<button class="btn btn-primary" onclick="UI.showAddTeam('${player.id}')">Tilføj Hold</button>`;
                    } else {
                        playerTeams.forEach(team => {
                            html += `<div style="margin-top: 15px;">`;
                            html += `<div class="flex-between">`;
                            html += `<h4>🚴 ${team.name}</h4>`;
                            html += `<div>`;
                            html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showAddRider('${team.id}')">Tilføj Rytter</button>`;
                            html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showEditTeam('${team.id}', '${team.name.replace(/'/g, "\\'")}')">✏️ Rediger</button>`;
                            html += `<button class="btn btn-danger" onclick="UI.confirmDeleteTeam('${team.id}', '${team.name.replace(/'/g, "\\'")}')">🗑️ Slet</button>`;
                            html += `</div>`;
                            html += `</div>`;

                            if (team.riders.length > 0) {
                                html += '<table style="margin-top: 10px;">';
                                html += '<tr><th>Rytter</th><th>World Tour Point</th><th>Sejre</th><th>Handlinger</th></tr>';
                                team.riders.forEach(rider => {
                                    const standing = game.riderStandings.find(r => r.riderId === rider.id) || { worldTourPoints: 0, wins: 0 };
                                    html += '<tr>';
                                    html += `<td>${rider.name}</td>`;
                                    html += `<td>${standing.worldTourPoints}</td>`;
                                    html += `<td>${standing.wins}</td>`;
                                    html += `<td>`;
                                    html += `<button class="btn btn-secondary" style="margin-right: 5px; font-size: 0.8em; padding: 4px 8px;" onclick="UI.showEditRider('${rider.id}', '${rider.name.replace(/'/g, "\\'")}')">✏️</button>`;
                                    html += `<button class="btn btn-danger" style="font-size: 0.8em; padding: 4px 8px;" onclick="UI.confirmDeleteRider('${rider.id}', '${rider.name.replace(/'/g, "\\'")}')">🗑️</button>`;
                                    html += `</td>`;
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
                }
            });
        }

        playersList.innerHTML = html;
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
            // Sort races by date (newest first)
            const sortedRaces = [...game.races].sort((a, b) => {
                const dateA = a.date || a.createdDate;
                const dateB = b.date || b.createdDate;
                return new Date(dateB) - new Date(dateA);
            });

            html += '<table>';
            html += '<tr><th>Løb</th><th>Vinder</th><th>Dato</th><th>Handling</th></tr>';
            sortedRaces.forEach(race => {
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

                // Use race.date if available, otherwise createdDate
                const displayDate = race.date ? new Date(race.date).toLocaleDateString('da-DK') : new Date(race.createdDate).toLocaleDateString('da-DK');

                html += '<tr>';
                html += `<td>${race.name}</td>`;
                html += `<td>${winner}</td>`;
                html += `<td>${displayDate}</td>`;
                html += `<td>`;
                html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.viewRace('${race.id}')">Se Løb</button>`;
                html += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="UI.showEditRace('${race.id}')">✏️</button>`;
                html += `<button class="btn btn-danger" onclick="UI.confirmDeleteRace('${race.id}', '${race.name.replace(/'/g, "\\'")}')">🗑️</button>`;
                html += `</td>`;
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
        html += '<div class="flex-between">';
        html += '<h2>Rytter Stilling</h2>';
        html += '<button class="btn btn-success" onclick="UI.exportRiderStandingsCSV()">📥 Eksporter CSV</button>';
        html += '</div>';

        // Filters
        html += '<div style="display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap; align-items: center;">';
        html += '<div>';
        html += '<label style="margin-right: 8px;">Filtrer efter hold:</label>';
        html += '<select id="filter-team" onchange="UI.showGameDashboard(); UI.showTab(\'standings\');" style="padding: 5px;">';
        html += '<option value="">Alle hold</option>';
        game.teams.forEach(team => {
            html += `<option value="${team.id}">${team.name}</option>`;
        });
        html += '</select>';
        html += '</div>';
        html += '<div>';
        html += '<label style="margin-right: 8px; cursor: pointer;"><input type="checkbox" id="filter-active" onchange="UI.showGameDashboard(); UI.showTab(\'standings\');"> Kun aktive ryttere (med point)</label>';
        html += '</div>';
        html += '</div>';

        if (game.riderStandings.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            // Apply filters
            const filterTeamId = document.getElementById('filter-team')?.value || '';
            const filterActive = document.getElementById('filter-active')?.checked || false;

            let filteredRiders = game.riderStandings;

            // Filter by team
            if (filterTeamId) {
                filteredRiders = filteredRiders.filter(standing => {
                    const rider = DataManager.getRiderById(standing.riderId);
                    return rider && rider.teamId === filterTeamId;
                });
            }

            // Filter active only
            if (filterActive) {
                filteredRiders = filteredRiders.filter(standing => standing.worldTourPoints > 0);
            }

            if (filteredRiders.length === 0) {
                html += '<p style="margin-top: 15px;">Ingen ryttere matcher filtret.</p>';
            } else {
            // Sort riders based on current sort state
            const sortCol = this.sortState.riderStandings.column;
            const sortDir = this.sortState.riderStandings.direction;

            const sortedRiders = [...filteredRiders].sort((a, b) => {
                const riderA = DataManager.getRiderById(a.riderId);
                const riderB = DataManager.getRiderById(b.riderId);

                let valA, valB;
                if (sortCol === 'name') {
                    valA = riderA ? riderA.name : '';
                    valB = riderB ? riderB.name : '';
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else if (sortCol === 'team') {
                    const teamA = riderA ? DataManager.getTeamById(riderA.teamId) : null;
                    const teamB = riderB ? DataManager.getTeamById(riderB.teamId) : null;
                    valA = teamA ? teamA.name : '';
                    valB = teamB ? teamB.name : '';
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else if (sortCol === 'points') {
                    valA = a.worldTourPoints;
                    valB = b.worldTourPoints;
                } else if (sortCol === 'wins') {
                    valA = a.wins;
                    valB = b.wins;
                }

                return sortDir === 'asc' ? valA - valB : valB - valA;
            });

            const arrow = (col) => {
                if (this.sortState.riderStandings.column === col) {
                    return this.sortState.riderStandings.direction === 'asc' ? ' ↑' : ' ↓';
                }
                return '';
            };

            html += '<table>';
            html += '<tr>';
            html += '<th>Position</th>';
            html += `<th style="cursor: pointer;" onclick="UI.sortRiderStandings('name')">Rytter${arrow('name')}</th>`;
            html += `<th style="cursor: pointer;" onclick="UI.sortRiderStandings('team')">Hold${arrow('team')}</th>`;
            html += `<th style="cursor: pointer;" onclick="UI.sortRiderStandings('points')">World Tour Point${arrow('points')}</th>`;
            html += `<th style="cursor: pointer;" onclick="UI.sortRiderStandings('wins')">Sejre${arrow('wins')}</th>`;
            html += '</tr>';

            sortedRiders.forEach((standing, index) => {
                const rider = DataManager.getRiderById(standing.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                const teamColor = team && team.color ? team.color : '#95a5a6';
                html += '<tr>';
                html += `<td>${index + 1}</td>`;
                html += `<td>${rider ? rider.name : 'Ukendt'}</td>`;
                html += `<td><span style="display: inline-block; width: 12px; height: 12px; background: ${teamColor}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td><strong>${standing.worldTourPoints}</strong></td>`;
                html += `<td>${standing.wins}</td>`;
                html += '</tr>';
            });
            html += '</table>';
            }
        }
        html += '</div>';

        html += '<div class="card mt-20">';
        html += '<div class="flex-between">';
        html += '<h2>Hold Stilling</h2>';
        html += '<button class="btn btn-success" onclick="UI.exportTeamStandingsCSV()">📥 Eksporter CSV</button>';
        html += '</div>';

        if (game.teamStandings.length === 0) {
            html += '<p>Ingen data endnu.</p>';
        } else {
            // Sort teams based on current sort state
            const sortCol = this.sortState.teamStandings.column;
            const sortDir = this.sortState.teamStandings.direction;

            const sortedTeams = [...game.teamStandings].sort((a, b) => {
                const teamA = DataManager.getTeamById(a.teamId);
                const teamB = DataManager.getTeamById(b.teamId);

                let valA, valB;
                if (sortCol === 'name') {
                    valA = teamA ? teamA.name : '';
                    valB = teamB ? teamB.name : '';
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else if (sortCol === 'player') {
                    const playerA = teamA ? DataManager.getPlayerById(teamA.playerId) : null;
                    const playerB = teamB ? DataManager.getPlayerById(teamB.playerId) : null;
                    valA = playerA ? playerA.name : '';
                    valB = playerB ? playerB.name : '';
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else if (sortCol === 'points') {
                    valA = a.worldTourPoints;
                    valB = b.worldTourPoints;
                }

                return sortDir === 'asc' ? valA - valB : valB - valA;
            });

            const arrow = (col) => {
                if (this.sortState.teamStandings.column === col) {
                    return this.sortState.teamStandings.direction === 'asc' ? ' ↑' : ' ↓';
                }
                return '';
            };

            html += '<table>';
            html += '<tr>';
            html += '<th>Position</th>';
            html += `<th style="cursor: pointer;" onclick="UI.sortTeamStandings('name')">Hold${arrow('name')}</th>`;
            html += `<th style="cursor: pointer;" onclick="UI.sortTeamStandings('player')">Spiller${arrow('player')}</th>`;
            html += `<th style="cursor: pointer;" onclick="UI.sortTeamStandings('points')">World Tour Point${arrow('points')}</th>`;
            html += '</tr>';

            sortedTeams.forEach((standing, index) => {
                const team = DataManager.getTeamById(standing.teamId);
                const player = team ? DataManager.getPlayerById(team.playerId) : null;
                const teamColor = team && team.color ? team.color : '#95a5a6';
                html += '<tr>';
                html += `<td>${index + 1}</td>`;
                html += `<td><span style="display: inline-block; width: 12px; height: 12px; background: ${teamColor}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>${team ? team.name : 'Ukendt'}</td>`;
                html += `<td>${player ? player.name : 'Ukendt'}</td>`;
                html += `<td><strong>${standing.worldTourPoints}</strong></td>`;
                html += '</tr>';
            });
            html += '</table>';
        }
        html += '</div>';

        container.innerHTML = html;
    },

    // Sort rider standings
    sortRiderStandings(column) {
        if (this.sortState.riderStandings.column === column) {
            // Toggle direction
            this.sortState.riderStandings.direction =
                this.sortState.riderStandings.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to descending
            this.sortState.riderStandings.column = column;
            this.sortState.riderStandings.direction = column === 'name' || column === 'team' ? 'asc' : 'desc';
        }
        this.showGameDashboard();
        this.showTab('standings');
    },

    // Sort team standings
    sortTeamStandings(column) {
        if (this.sortState.teamStandings.column === column) {
            // Toggle direction
            this.sortState.teamStandings.direction =
                this.sortState.teamStandings.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to descending
            this.sortState.teamStandings.column = column;
            this.sortState.teamStandings.direction = column === 'name' || column === 'player' ? 'asc' : 'desc';
        }
        this.showGameDashboard();
        this.showTab('standings');
    },

    // Show statistics tab
    showStatisticsTab(container) {
        const game = DataManager.getCurrentGame();

        let html = '<div class="card">';
        html += '<div class="flex-between">';
        html += '<h2>📊 Statistik Dashboard</h2>';
        html += '<button class="btn btn-success" onclick="UI.exportStatisticsCSV()">📥 Eksporter CSV</button>';
        html += '</div>';
        html += '</div>';

        // Rider statistics
        html += '<div class="card">';
        html += '<h3>Rytter Statistik</h3>';

        if (game.riderStandings.length === 0) {
            html += '<p>Ingen rytter data endnu.</p>';
        } else {
            // Calculate rider statistics
            const riderStats = game.riderStandings.map(standing => {
                const rider = DataManager.getRiderById(standing.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;

                // Count races participated
                let racesParticipated = 0;
                let totalPositions = 0;
                let bestPosition = Infinity;
                let podiums = 0; // Top 3 finishes

                game.races.forEach(race => {
                    if (race.type === 'one-day') {
                        const result = race.results.find(r => r.riderId === standing.riderId);
                        if (result) {
                            racesParticipated++;
                            totalPositions += result.position;
                            if (result.position < bestPosition) bestPosition = result.position;
                            if (result.position <= 3) podiums++;
                        }
                    } else if (race.type === 'stage') {
                        // Check if rider participated in any stage
                        let participatedInRace = false;
                        race.stages.forEach(stage => {
                            const result = stage.results.find(r => r.riderId === standing.riderId);
                            if (result && !participatedInRace) {
                                participatedInRace = true;
                                racesParticipated++;
                            }
                        });

                        // Check GC position
                        if (race.generalClassification) {
                            const gcPosition = race.generalClassification.findIndex(gc => gc.riderId === standing.riderId);
                            if (gcPosition !== -1) {
                                const position = gcPosition + 1;
                                totalPositions += position;
                                if (position < bestPosition) bestPosition = position;
                                if (position <= 3) podiums++;
                            }
                        }
                    }
                });

                const avgPosition = racesParticipated > 0 ? (totalPositions / racesParticipated).toFixed(1) : 'N/A';
                const bestPos = bestPosition === Infinity ? 'N/A' : bestPosition;

                return {
                    riderId: standing.riderId,
                    riderName: rider ? rider.name : 'Ukendt',
                    teamName: team ? team.name : 'Ukendt',
                    points: standing.worldTourPoints,
                    wins: standing.wins,
                    races: racesParticipated,
                    avgPosition: avgPosition,
                    bestPosition: bestPos,
                    podiums: podiums
                };
            });

            // Sort by points (descending)
            riderStats.sort((a, b) => b.points - a.points);

            // Show top 15 riders
            const topRiders = riderStats.slice(0, 15);

            html += '<table>';
            html += '<tr>';
            html += '<th>Rytter</th>';
            html += '<th>Hold</th>';
            html += '<th>Point</th>';
            html += '<th>Sejre</th>';
            html += '<th>Podier</th>';
            html += '<th>Løb</th>';
            html += '<th>Gns. Plac.</th>';
            html += '<th>Bedste</th>';
            html += '<th>Performance</th>';
            html += '</tr>';

            topRiders.forEach(stat => {
                // Calculate performance bar (based on points, max 100% = top rider's points)
                const maxPoints = topRiders[0].points;
                const performancePercent = maxPoints > 0 ? Math.round((stat.points / maxPoints) * 100) : 0;

                // Get team color
                const rider = DataManager.getRiderById(stat.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                const teamColor = team && team.color ? team.color : '#95a5a6';

                html += '<tr>';
                html += `<td><strong>${stat.riderName}</strong></td>`;
                html += `<td><span style="display: inline-block; width: 12px; height: 12px; background: ${teamColor}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>${stat.teamName}</td>`;
                html += `<td>${stat.points}</td>`;
                html += `<td>${stat.wins}</td>`;
                html += `<td>${stat.podiums}</td>`;
                html += `<td>${stat.races}</td>`;
                html += `<td>${stat.avgPosition}</td>`;
                html += `<td>${stat.bestPosition}</td>`;
                html += `<td><div style="background: linear-gradient(90deg, #3498db ${performancePercent}%, #ecf0f1 ${performancePercent}%); padding: 5px 10px; border-radius: 4px; text-align: center; font-weight: bold;">${performancePercent}%</div></td>`;
                html += '</tr>';
            });

            html += '</table>';
        }
        html += '</div>';

        // Team statistics
        html += '<div class="card">';
        html += '<h3>Hold Statistik</h3>';

        if (game.teamStandings.length === 0) {
            html += '<p>Ingen hold data endnu.</p>';
        } else {
            // Calculate team statistics
            const teamStats = game.teamStandings.map(standing => {
                const team = DataManager.getTeamById(standing.teamId);
                const player = team ? DataManager.getPlayerById(team.playerId) : null;

                // Count riders in team
                const riderCount = team ? team.riders.length : 0;

                // Count wins from riders
                let totalWins = 0;
                if (team && team.riders) {
                    team.riders.forEach(rider => {
                        const riderStanding = game.riderStandings.find(rs => rs.riderId === rider.id);
                        if (riderStanding) {
                            totalWins += riderStanding.wins;
                        }
                    });
                }

                const avgPointsPerRider = riderCount > 0 ? (standing.worldTourPoints / riderCount).toFixed(1) : '0.0';

                return {
                    teamId: standing.teamId,
                    teamName: team ? team.name : 'Ukendt',
                    playerName: player ? player.name : 'Ukendt',
                    points: standing.worldTourPoints,
                    riderCount: riderCount,
                    avgPointsPerRider: avgPointsPerRider,
                    totalWins: totalWins
                };
            });

            // Sort by points (descending)
            teamStats.sort((a, b) => b.points - a.points);

            // Show top 10 teams
            const topTeams = teamStats.slice(0, 10);

            html += '<table>';
            html += '<tr>';
            html += '<th>Hold</th>';
            html += '<th>Spiller</th>';
            html += '<th>Total Point</th>';
            html += '<th>Ryttere</th>';
            html += '<th>Gns. Point/Rytter</th>';
            html += '<th>Sejre</th>';
            html += '<th>Performance</th>';
            html += '</tr>';

            topTeams.forEach(stat => {
                // Calculate performance bar
                const maxPoints = topTeams[0].points;
                const performancePercent = maxPoints > 0 ? Math.round((stat.points / maxPoints) * 100) : 0;

                // Get team color
                const team = DataManager.getTeamById(stat.teamId);
                const teamColor = team && team.color ? team.color : '#95a5a6';

                html += '<tr>';
                html += `<td><span style="display: inline-block; width: 12px; height: 12px; background: ${teamColor}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span><strong>${stat.teamName}</strong></td>`;
                html += `<td>${stat.playerName}</td>`;
                html += `<td>${stat.points}</td>`;
                html += `<td>${stat.riderCount}</td>`;
                html += `<td>${stat.avgPointsPerRider}</td>`;
                html += `<td>${stat.totalWins}</td>`;
                html += `<td><div style="background: linear-gradient(90deg, #27ae60 ${performancePercent}%, #ecf0f1 ${performancePercent}%); padding: 5px 10px; border-radius: 4px; text-align: center; font-weight: bold;">${performancePercent}%</div></td>`;
                html += '</tr>';
            });

            html += '</table>';
        }
        html += '</div>';

        // Stage wins overview
        html += '<div class="card">';
        html += '<h3>🏆 Etapevindere Oversigt</h3>';

        // Calculate stage wins per rider
        const stageWins = new Map();
        game.races.forEach(race => {
            if (race.raceFormat === 'stage' && race.stages) {
                race.stages.forEach(stage => {
                    if (stage.results && stage.results.length > 0) {
                        const winner = stage.results.find(r => r.position === 1);
                        if (winner) {
                            if (!stageWins.has(winner.riderId)) {
                                stageWins.set(winner.riderId, []);
                            }
                            stageWins.get(winner.riderId).push({
                                raceName: race.name,
                                stageName: stage.name,
                                stageNumber: stage.stageNumber
                            });
                        }
                    }
                });
            }
        });

        if (stageWins.size === 0) {
            html += '<p>Ingen etapesejre endnu.</p>';
        } else {
            // Sort by number of wins
            const sortedWins = Array.from(stageWins.entries())
                .map(([riderId, wins]) => {
                    const rider = DataManager.getRiderById(riderId);
                    const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                    return {
                        riderId,
                        riderName: rider ? rider.name : 'Ukendt',
                        teamName: team ? team.name : 'Ukendt',
                        teamColor: team && team.color ? team.color : '#95a5a6',
                        wins: wins
                    };
                })
                .sort((a, b) => b.wins.length - a.wins.length);

            html += '<table>';
            html += '<tr><th>Rytter</th><th>Hold</th><th>Antal Sejre</th><th>Etaper</th></tr>';
            sortedWins.forEach(riderWins => {
                html += '<tr>';
                html += `<td><strong>${riderWins.riderName}</strong></td>`;
                html += `<td><span style="display: inline-block; width: 12px; height: 12px; background: ${riderWins.teamColor}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>${riderWins.teamName}</td>`;
                html += `<td><strong>${riderWins.wins.length}</strong></td>`;
                html += '<td><ul style="margin: 0; padding-left: 20px;">';
                riderWins.wins.forEach(win => {
                    html += `<li style="font-size: 0.9em;">${win.raceName} - Etape ${win.stageNumber}: ${win.stageName}</li>`;
                });
                html += '</ul></td>';
                html += '</tr>';
            });
            html += '</table>';
        }
        html += '</div>';

        // Race statistics
        html += '<div class="card">';
        html += '<h3>Løb Statistik</h3>';

        if (game.races.length === 0) {
            html += '<p>Ingen løb endnu.</p>';
        } else {
            const oneDayRaces = game.races.filter(r => r.type === 'one-day').length;
            const stageRaces = game.races.filter(r => r.type === 'stage').length;
            const totalStages = game.races
                .filter(r => r.type === 'stage')
                .reduce((sum, race) => sum + race.stages.length, 0);

            html += '<div class="grid grid-3">';
            html += `<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3498db, #5DADE2); color: white; border-radius: 8px;">`;
            html += `<h2 style="margin: 0; color: white;">${game.races.length}</h2>`;
            html += `<p style="margin: 5px 0 0 0;">Total Løb</p>`;
            html += `</div>`;
            html += `<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #27ae60, #58D68D); color: white; border-radius: 8px;">`;
            html += `<h2 style="margin: 0; color: white;">${oneDayRaces}</h2>`;
            html += `<p style="margin: 5px 0 0 0;">Endagsløb</p>`;
            html += `</div>`;
            html += `<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #e74c3c, #EC7063); color: white; border-radius: 8px;">`;
            html += `<h2 style="margin: 0; color: white;">${stageRaces}</h2>`;
            html += `<p style="margin: 5px 0 0 0;">Etapeløb</p>`;
            html += `</div>`;
            html += `</div>`;

            if (stageRaces > 0) {
                html += `<p style="margin-top: 15px; text-align: center; color: #7f8c8d;">Total etaper: <strong>${totalStages}</strong> | Gennemsnit pr. løb: <strong>${(totalStages / stageRaces).toFixed(1)}</strong></p>`;
            }
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

            // Check for duplicate
            const game = DataManager.getCurrentGame();
            const existingPlayer = game.players.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (existingPlayer) {
                if (!confirm(`Der findes allerede en spiller med navnet "${existingPlayer.name}".\n\nVil du tilføje en til med samme navn?`)) {
                    return;
                }
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
            <div class="form-group">
                <label>Holdfarve</label>
                <input type="color" id="team-color" value="#3498db" style="width: 100%; height: 40px; cursor: pointer;">
            </div>
            <button class="btn btn-success" onclick="UI.addTeam()">Tilføj Hold</button>
        `);
    },

    // Add team
    addTeam() {
        try {
            const name = document.getElementById('team-name').value.trim();
            const playerId = document.getElementById('team-player').value;
            const color = document.getElementById('team-color').value;

            if (!name) {
                alert('Indtast venligst et holdnavn');
                return;
            }

            // Check for duplicate
            const game = DataManager.getCurrentGame();
            const existingTeam = game.teams.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (existingTeam) {
                if (!confirm(`Der findes allerede et hold med navnet "${existingTeam.name}".\n\nVil du tilføje et til med samme navn?`)) {
                    return;
                }
            }

            DataManager.addTeam(name, playerId, color);
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

            // Check for duplicate rider name across ALL teams
            const game = DataManager.getCurrentGame();
            let existingRider = null;
            for (const team of game.teams) {
                existingRider = team.riders.find(r => r.name.toLowerCase() === name.toLowerCase());
                if (existingRider) break;
            }

            if (existingRider) {
                if (!confirm(`Der findes allerede en rytter med navnet "${existingRider.name}".\n\nVil du tilføje en til med samme navn?`)) {
                    return;
                }
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

    // Edit player
    showEditPlayer(playerId, currentName) {
        this.showModal(`
            <h2>Rediger Spiller</h2>
            <div class="form-group">
                <label>Nyt navn</label>
                <input type="text" id="edit-player-name" value="${currentName}" placeholder="Spillernavn">
                <input type="hidden" id="edit-player-id" value="${playerId}">
            </div>
            <button class="btn btn-success" onclick="UI.editPlayer()">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    editPlayer() {
        const playerId = document.getElementById('edit-player-id').value;
        const newName = document.getElementById('edit-player-name').value.trim();

        if (!newName) {
            alert('Indtast venligst et navn');
            return;
        }

        if (DataManager.editPlayer(playerId, newName)) {
            this.closeModal();
            setTimeout(() => {
                this.showGameDashboard();
                this.showTab('players');
            }, 50);
        } else {
            alert('Fejl ved redigering af spiller');
        }
    },

    confirmDeletePlayer(playerId, playerName) {
        if (confirm(`Er du sikker på at du vil slette spilleren "${playerName}"?\n\nDette vil også slette alle spillerens hold og ryttere.`)) {
            if (DataManager.deletePlayer(playerId)) {
                this.showGameDashboard();
                this.showTab('players');
            } else {
                alert('Fejl ved sletning af spiller');
            }
        }
    },

    // Edit team
    showEditTeam(teamId, currentName) {
        this.showModal(`
            <h2>Rediger Hold</h2>
            <div class="form-group">
                <label>Nyt navn</label>
                <input type="text" id="edit-team-name" value="${currentName}" placeholder="Holdnavn">
                <input type="hidden" id="edit-team-id" value="${teamId}">
            </div>
            <button class="btn btn-success" onclick="UI.editTeam()">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    editTeam() {
        const teamId = document.getElementById('edit-team-id').value;
        const newName = document.getElementById('edit-team-name').value.trim();

        if (!newName) {
            alert('Indtast venligst et navn');
            return;
        }

        if (DataManager.editTeam(teamId, newName)) {
            this.closeModal();
            setTimeout(() => {
                this.showGameDashboard();
                this.showTab('players');
            }, 50);
        } else {
            alert('Fejl ved redigering af hold');
        }
    },

    confirmDeleteTeam(teamId, teamName) {
        if (confirm(`Er du sikker på at du vil slette holdet "${teamName}"?\n\nDette vil også slette alle holdets ryttere.`)) {
            if (DataManager.deleteTeam(teamId)) {
                this.showGameDashboard();
                this.showTab('players');
            } else {
                alert('Fejl ved sletning af hold');
            }
        }
    },

    // Edit rider
    showEditRider(riderId, currentName) {
        this.showModal(`
            <h2>Rediger Rytter</h2>
            <div class="form-group">
                <label>Nyt navn</label>
                <input type="text" id="edit-rider-name" value="${currentName}" placeholder="Rytternavn">
                <input type="hidden" id="edit-rider-id" value="${riderId}">
            </div>
            <button class="btn btn-success" onclick="UI.editRider()">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    editRider() {
        const riderId = document.getElementById('edit-rider-id').value;
        const newName = document.getElementById('edit-rider-name').value.trim();

        if (!newName) {
            alert('Indtast venligst et navn');
            return;
        }

        if (DataManager.editRider(riderId, newName)) {
            this.closeModal();
            setTimeout(() => {
                this.showGameDashboard();
                this.showTab('players');
            }, 50);
        } else {
            alert('Fejl ved redigering af rytter');
        }
    },

    confirmDeleteRider(riderId, riderName) {
        if (confirm(`Er du sikker på at du vil slette rytteren "${riderName}"?`)) {
            if (DataManager.deleteRider(riderId)) {
                this.showGameDashboard();
                this.showTab('players');
            } else {
                alert('Fejl ved sletning af rytter');
            }
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
                <label>Dato (valgfrit)</label>
                <input type="date" id="race-date">
                <small style="color: #7f8c8d; display: block; margin-top: 5px;">Dette er løbets oprindelige dato, ikke spilledatoen</small>
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

    // Edit race
    showEditRace(raceId) {
        const race = DataManager.getRaceById(raceId);
        if (!race) return;

        this.showModal(`
            <h2>Rediger Løb</h2>
            <div class="form-group">
                <label>Løbsnavn</label>
                <input type="text" id="edit-race-name" value="${race.name}" placeholder="Løbsnavn">
            </div>
            <div class="form-group">
                <label>Dato (valgfrit)</label>
                <input type="date" id="edit-race-date" value="${race.date || ''}">
                <small style="color: #7f8c8d; display: block; margin-top: 5px;">Dette er løbets oprindelige dato, ikke spilledatoen</small>
            </div>
            <div class="form-group">
                <label>Løbstype</label>
                <select id="edit-race-type">
                    <option value="tour-de-france" ${race.type === 'tour-de-france' ? 'selected' : ''}>Tour de France (800 point)</option>
                    <option value="giro" ${race.type === 'giro' ? 'selected' : ''}>Giro d'Italia (800 point)</option>
                    <option value="vuelta" ${race.type === 'vuelta' ? 'selected' : ''}>Vuelta a España (800 point)</option>
                    <option value="monument" ${race.type === 'monument' ? 'selected' : ''}>Monument (300 point)</option>
                    <option value="worldcup-major" ${race.type === 'worldcup-major' ? 'selected' : ''}>World Cup Major (200 point)</option>
                    <option value="worldcup-other" ${race.type === 'worldcup-other' ? 'selected' : ''}>World Cup Other (75 point)</option>
                </select>
            </div>
            <input type="hidden" id="edit-race-id" value="${raceId}">
            <button class="btn btn-success" onclick="UI.saveEditRace()">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    saveEditRace() {
        const raceId = document.getElementById('edit-race-id').value;
        const newName = document.getElementById('edit-race-name').value.trim();
        const newDate = document.getElementById('edit-race-date').value;
        const newType = document.getElementById('edit-race-type').value;

        if (!newName) {
            alert('Indtast venligst et løbsnavn');
            return;
        }

        if (DataManager.editRace(raceId, newName, newType, newDate)) {
            this.closeModal();
            setTimeout(() => {
                this.showGameDashboard();
                this.showTab('races');
            }, 50);
        } else {
            alert('Fejl ved redigering af løb');
        }
    },

    confirmDeleteRace(raceId, raceName) {
        if (confirm(`Er du sikker på at du vil slette løbet "${raceName}"?\n\nDette vil slette alle resultater for dette løb.`)) {
            if (DataManager.deleteRace(raceId)) {
                this.showGameDashboard();
                this.showTab('races');
            } else {
                alert('Fejl ved sletning af løb');
            }
        }
    },

    // Show edit race notes
    showEditRaceNotes(raceId) {
        const race = DataManager.getRaceById(raceId);
        if (!race) return;

        this.showModal(`
            <h2>Rediger Noter - ${race.name}</h2>
            <div class="form-group">
                <label>Noter (valgfrit)</label>
                <textarea id="race-notes" rows="6" style="width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 4px;">${race.notes || ''}</textarea>
                <small style="color: #7f8c8d; display: block; margin-top: 5px;">Tilføj noter om vejr, særlige hændelser, strategi osv.</small>
            </div>
            <button class="btn btn-success" onclick="UI.saveRaceNotes('${raceId}')">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    // Save race notes
    saveRaceNotes(raceId) {
        const notes = document.getElementById('race-notes').value.trim();
        if (DataManager.updateRaceNotes(raceId, notes)) {
            this.closeModal();
            this.viewRace(raceId);
        } else {
            alert('Fejl ved gem af noter');
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
        if (race.date) {
            html += `<p><strong>Dato:</strong> ${new Date(race.date).toLocaleDateString('da-DK')}</p>`;
        }
        if (race.notes) {
            html += `<div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px;">`;
            html += `<p style="margin: 0; white-space: pre-wrap;"><strong>📝 Noter:</strong><br>${race.notes}</p>`;
            html += `</div>`;
        }
        html += `<div class="flex gap-10 mt-20" style="flex-wrap: wrap;">`;
        html += `<button class="btn btn-primary" onclick="UI.showAddOneDayResult('${race.id}')">Registrer Resultat</button>`;
        html += `<button class="btn btn-secondary" onclick="UI.showEditRaceNotes('${race.id}')">📝 ${race.notes ? 'Rediger' : 'Tilføj'} Noter</button>`;
        if (race.results.length > 0) {
            html += `<button class="btn btn-danger" onclick="UI.confirmClearOneDayResults('${race.id}', '${race.name.replace(/'/g, "\\'")}')">Ryd Alle Resultater</button>`;
        }
        html += '</div>';
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
        if (race.date) {
            html += `<p><strong>Dato:</strong> ${new Date(race.date).toLocaleDateString('da-DK')}</p>`;
        }
        if (race.notes) {
            html += `<div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px;">`;
            html += `<p style="margin: 0; white-space: pre-wrap;"><strong>📝 Noter:</strong><br>${race.notes}</p>`;
            html += `</div>`;
        }
        html += '<div class="flex gap-10 mt-20" style="flex-wrap: wrap;">';
        html += `<button class="btn btn-primary" onclick="UI.showAddStage('${race.id}')">Tilføj Etape</button>`;
        html += `<button class="btn btn-secondary" onclick="UI.showYellowJerseyBonus('${race.id}')">Førertrøje Bonus</button>`;
        html += `<button class="btn btn-secondary" onclick="UI.showEditRaceNotes('${race.id}')">📝 ${race.notes ? 'Rediger' : 'Tilføj'} Noter</button>`;
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
                if (stage.results && stage.results.length > 0) {
                    html += `<button class="btn btn-danger" onclick="UI.confirmClearStageResults('${race.id}', '${stage.id}', '${stage.name.replace(/'/g, "\\'")}')">Ryd Resultater</button>`;
                }
                html += `<button class="btn btn-secondary" onclick="UI.showEditStage('${race.id}', '${stage.id}')">✏️</button>`;
                html += `<button class="btn btn-danger" onclick="UI.confirmDeleteStage('${race.id}', '${stage.id}', '${stage.name.replace(/'/g, "\\'")}')">🗑️</button>`;
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

    // Edit stage
    showEditStage(raceId, stageId) {
        const race = DataManager.getRaceById(raceId);
        if (!race) return;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return;

        this.showModal(`
            <h2>Rediger Etape</h2>
            <div class="form-group">
                <label>Etapenavn</label>
                <input type="text" id="edit-stage-name" value="${stage.name}" placeholder="f.eks. Etape 1">
            </div>
            <div class="form-group">
                <label>Etapenummer</label>
                <input type="number" id="edit-stage-number" value="${stage.stageNumber}" min="1">
            </div>
            <div class="form-group">
                <label>Etapetype</label>
                <select id="edit-stage-type">
                    <option value="flat" ${stage.stageType === 'flat' ? 'selected' : ''}>Flad</option>
                    <option value="hilly" ${stage.stageType === 'hilly' ? 'selected' : ''}>Bakket</option>
                    <option value="mountain" ${stage.stageType === 'mountain' ? 'selected' : ''}>Bjerg</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="edit-finish-on-mountain" ${stage.finishOnMountain ? 'checked' : ''}
                           onchange="document.getElementById('edit-finish-mountain-category-group').style.display = this.checked ? 'block' : 'none'">
                    Slutter på bjerg
                </label>
            </div>
            <div class="form-group" id="edit-finish-mountain-category-group" style="display: ${stage.finishOnMountain ? 'block' : 'none'}">
                <label>Bjergkategori ved målgang</label>
                <select id="edit-finish-mountain-category">
                    <option value="cat4" ${stage.finishMountainCategory === 'cat4' ? 'selected' : ''}>Cat 4</option>
                    <option value="cat3" ${stage.finishMountainCategory === 'cat3' ? 'selected' : ''}>Cat 3</option>
                    <option value="cat2" ${stage.finishMountainCategory === 'cat2' ? 'selected' : ''}>Cat 2</option>
                    <option value="cat1" ${stage.finishMountainCategory === 'cat1' ? 'selected' : ''}>Cat 1</option>
                    <option value="hc" ${stage.finishMountainCategory === 'hc' ? 'selected' : ''}>HC</option>
                </select>
            </div>
            <input type="hidden" id="edit-stage-race-id" value="${raceId}">
            <input type="hidden" id="edit-stage-id" value="${stageId}">
            <button class="btn btn-success" onclick="UI.saveEditStage()">Gem</button>
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
        `);
    },

    saveEditStage() {
        const raceId = document.getElementById('edit-stage-race-id').value;
        const stageId = document.getElementById('edit-stage-id').value;
        const name = document.getElementById('edit-stage-name').value.trim();
        const number = parseInt(document.getElementById('edit-stage-number').value);
        const stageType = document.getElementById('edit-stage-type').value;
        const finishOnMountain = document.getElementById('edit-finish-on-mountain').checked;
        const finishMountainCategory = finishOnMountain ? document.getElementById('edit-finish-mountain-category').value : null;

        if (!name) {
            alert('Indtast venligst et etapenavn');
            return;
        }

        if (DataManager.editStage(raceId, stageId, name, number, stageType, finishOnMountain, finishMountainCategory)) {
            this.closeModal();
            setTimeout(() => {
                this.viewRace(raceId);
            }, 50);
        } else {
            alert('Fejl ved redigering af etape');
        }
    },

    confirmDeleteStage(raceId, stageId, stageName) {
        if (confirm(`Er du sikker på at du vil slette etapen "${stageName}"?\n\nDette vil slette alle resultater for denne etape.`)) {
            if (DataManager.deleteStage(raceId, stageId)) {
                this.viewRace(raceId);
            } else {
                alert('Fejl ved sletning af etape');
            }
        }
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

        // Determine how many rows to show initially
        const maxResults = Math.max(...Object.keys(resultsByPosition).map(Number), 0);
        const initialRows = Math.max(15, maxResults + 3);

        // Create rows for positions
        let tableRows = '';
        for (let position = 1; position <= initialRows; position++) {
            const existingResult = resultsByPosition[position];
            tableRows += `
                <tr id="result-row-${position}">
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                        ${existingResult ? `<script>document.getElementById('rider-${position}').value = '${existingResult.riderId}';</script>` : ''}
                    </td>
                    <td>
                        <select id="status-${position}" style="width: 100%; padding: 5px;">
                            <option value="">Normal</option>
                            <option value="DNF" ${existingResult && existingResult.status === 'DNF' ? 'selected' : ''}>DNF</option>
                            <option value="DSQ" ${existingResult && existingResult.status === 'DSQ' ? 'selected' : ''}>DSQ</option>
                        </select>
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
                <table style="width: 100%;" id="results-table">
                    <thead>
                        <tr style="position: sticky; top: 0; background: white;">
                            <th style="text-align: center; padding: 8px; width: 60px;">Plac.</th>
                            <th style="text-align: left; padding: 8px;">Rytter</th>
                            <th style="text-align: left; padding: 8px; width: 100px;">Status</th>
                            <th style="text-align: left; padding: 8px; width: 120px;">Tid</th>
                        </tr>
                    </thead>
                    <tbody id="results-tbody">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-secondary" onclick="UI.addMoreResultRows('${raceId}', ${initialRows})">➕ Tilføj 5 Rækker</button>
            </div>
            <div style="margin-top: 10px;">
                <button class="btn btn-success" onclick="UI.saveBatchOneDayResults('${raceId}')">Gem Alle Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= initialRows; position++) {
                const existingResult = resultsByPosition[position];
                if (existingResult) {
                    const select = document.getElementById(`rider-${position}`);
                    if (select) select.value = existingResult.riderId;
                }
            }
        });
    },

    // Add more result rows dynamically
    addMoreResultRows(raceId, currentRows) {
        const riders = DataManager.getAllRiders();
        const tbody = document.getElementById('results-tbody');
        if (!tbody) return;

        // Create rider options for dropdowns
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Add 5 more rows
        for (let i = 1; i <= 5; i++) {
            const position = currentRows + i;
            const row = document.createElement('tr');
            row.id = `result-row-${position}`;
            row.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${position}.</td>
                <td>
                    <select id="rider-${position}" style="width: 100%; padding: 5px;">
                        ${riderOptions}
                    </select>
                </td>
                <td>
                    <select id="status-${position}" style="width: 100%; padding: 5px;">
                        <option value="">Normal</option>
                        <option value="DNF">DNF</option>
                        <option value="DSQ">DSQ</option>
                    </select>
                </td>
                <td>
                    <input type="text"
                           id="time-${position}"
                           placeholder="4:23:15"
                           style="width: 100%; padding: 5px;">
                </td>
            `;
            tbody.appendChild(row);
        }

        // Update button to add more from new position
        const button = event.target;
        if (button) {
            button.onclick = () => UI.addMoreResultRows(raceId, currentRows + 5);
        }
    },

    // Add more stage result rows dynamically
    addMoreStageResultRows(raceId, stageId, currentRows, stageType) {
        const riders = DataManager.getAllRiders();
        const tbody = document.getElementById('results-tbody');
        if (!tbody) return;

        // Create rider options for dropdowns
        let riderOptions = '<option value="">-- Vælg rytter --</option>';
        riders.forEach(rider => {
            riderOptions += `<option value="${rider.id}">${rider.name}</option>`;
        });

        // Add 5 more rows
        for (let i = 1; i <= 5; i++) {
            const position = currentRows + i;
            const finishPoints = PointsCalculator.getStageFinishPoints(stageType, position);
            const row = document.createElement('tr');
            row.id = `stage-result-row-${position}`;
            row.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${position}.</td>
                <td>
                    <select id="rider-${position}" style="width: 100%; padding: 5px;">
                        ${riderOptions}
                    </select>
                </td>
                <td>
                    <input type="text"
                           id="time-${position}"
                           placeholder="4:23:15"
                           style="width: 100%; padding: 5px;">
                </td>
                <td style="text-align: center;">${finishPoints}p</td>
            `;
            tbody.appendChild(row);
        }

        // Update button to add more from new position
        const button = event.target;
        if (button) {
            button.onclick = () => UI.addMoreStageResultRows(raceId, stageId, currentRows + 5, stageType);
        }
    },

    // Save batch one-day results
    saveBatchOneDayResults(raceId) {
        const race = DataManager.getRaceById(raceId);
        const riders = DataManager.getAllRiders();
        const results = [];
        const errors = [];

        // Loop through all possible positions (check up to 200 positions to handle dynamically added rows)
        for (let position = 1; position <= 200; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const timeInput = document.getElementById(`time-${position}`);
            const statusSelect = document.getElementById(`status-${position}`);

            // Stop if we reach a position that doesn't exist
            if (!riderSelect || !timeInput || !statusSelect) break;

            const riderId = riderSelect.value;
            const time = timeInput.value.trim();
            const status = statusSelect.value;

            // Only add if rider is selected
            if (riderId) {
                // Handle DNF/DSQ status
                if (status === 'DNF' || status === 'DSQ') {
                    results.push({
                        riderId: riderId,
                        time: status,
                        position: position,
                        status: status
                    });
                } else if (time) {
                    // Normal finish - validate time format
                    const validation = DataManager.validateTimeFormat(time);
                    if (!validation.valid) {
                        errors.push(`Position ${position}: ${validation.error}`);
                    } else {
                        results.push({
                            riderId: riderId,
                            time: validation.formatted,
                            position: position
                        });
                    }
                }
            }
        }

        if (errors.length > 0) {
            alert('Fejl i tidsformater:\n\n' + errors.join('\n'));
            return;
        }

        if (results.length === 0) {
            alert('Indtast venligst mindst ét resultat');
            return;
        }

        // Warn if overwriting existing results
        if (race.results.length > 0) {
            if (!confirm(`Dette vil overskrive ${race.results.length} eksisterende resultat(er).\n\nEr du sikker?`)) {
                return;
            }
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

        // Determine how many rows to show initially
        const maxResults = Math.max(...Object.keys(resultsByPosition).map(Number), 0);
        const initialRows = Math.max(15, maxResults + 3);

        // Create rows for positions
        let tableRows = '';
        for (let position = 1; position <= initialRows; position++) {
            const existingResult = resultsByPosition[position];
            const finishPoints = PointsCalculator.getStageFinishPoints(stageType, position);
            tableRows += `
                <tr id="stage-result-row-${position}">
                    <td style="text-align: center; font-weight: bold;">${position}.</td>
                    <td>
                        <select id="rider-${position}" style="width: 100%; padding: 5px;">
                            ${riderOptions}
                        </select>
                    </td>
                    <td>
                        <select id="status-${position}" style="width: 100%; padding: 5px;">
                            <option value="">Normal</option>
                            <option value="DNF" ${existingResult && existingResult.status === 'DNF' ? 'selected' : ''}>DNF</option>
                            <option value="DSQ" ${existingResult && existingResult.status === 'DSQ' ? 'selected' : ''}>DSQ</option>
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
                            <th style="text-align: left; padding: 8px; width: 100px;">Status</th>
                            <th style="text-align: left; padding: 8px; width: 120px;">Tid</th>
                            <th style="text-align: center; padding: 8px; width: 80px;">Sprint P.</th>
                        </tr>
                    </thead>
                    <tbody id="results-tbody">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-secondary" onclick="UI.addMoreStageResultRows('${raceId}', '${stageId}', ${initialRows}, '${stageType}')">➕ Tilføj 5 Rækker</button>
            </div>
            <div style="margin-top: 10px;">
                <button class="btn btn-success" onclick="UI.saveBatchStageResults('${raceId}', '${stageId}')">Gem Alle Resultater</button>
                <button class="btn btn-secondary" onclick="UI.closeModal()">Annuller</button>
            </div>
        `, () => {
            // Set selected riders after modal is created
            for (let position = 1; position <= initialRows; position++) {
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
        const race = DataManager.getRaceById(raceId);
        const stage = race.stages.find(s => s.id === stageId);
        const riders = DataManager.getAllRiders();
        const results = [];
        const errors = [];

        // Loop through all possible positions (check up to 200 positions to handle dynamically added rows)
        for (let position = 1; position <= 200; position++) {
            const riderSelect = document.getElementById(`rider-${position}`);
            const timeInput = document.getElementById(`time-${position}`);
            const statusSelect = document.getElementById(`status-${position}`);

            // Stop if we reach a position that doesn't exist
            if (!riderSelect || !timeInput || !statusSelect) break;

            const riderId = riderSelect.value;
            const time = timeInput.value.trim();
            const status = statusSelect.value;

            // Only add if rider is selected
            if (riderId) {
                // Handle DNF/DSQ status
                if (status === 'DNF' || status === 'DSQ') {
                    results.push({
                        riderId: riderId,
                        time: status,
                        position: position,
                        status: status
                    });
                } else if (time) {
                    // Normal finish - validate time format
                    const validation = DataManager.validateTimeFormat(time);
                    if (!validation.valid) {
                        errors.push(`Position ${position}: ${validation.error}`);
                    } else {
                        results.push({
                            riderId: riderId,
                            time: validation.formatted,
                            position: position
                        });
                    }
                }
            }
        }

        if (errors.length > 0) {
            alert('Fejl i tidsformater:\n\n' + errors.join('\n'));
            return;
        }

        if (results.length === 0) {
            alert('Indtast venligst mindst ét resultat');
            return;
        }

        // Warn if overwriting existing results
        if (stage.results.length > 0) {
            if (!confirm(`Dette vil overskrive ${stage.results.length} eksisterende resultat(er).\n\nEr du sikker?`)) {
                return;
            }
        }

        DataManager.addBatchStageResults(raceId, stageId, results);
        this.closeModal();
        this.viewRace(raceId);
    },

    // Confirm clear one-day results
    confirmClearOneDayResults(raceId, raceName) {
        if (confirm(`Er du sikker på at du vil rydde ALLE resultater for "${raceName}"?\n\nDette kan ikke fortrydes.`)) {
            if (DataManager.clearOneDayResults(raceId)) {
                this.viewRace(raceId);
            } else {
                alert('Fejl ved rydning af resultater');
            }
        }
    },

    // Confirm clear stage results
    confirmClearStageResults(raceId, stageId, stageName) {
        if (confirm(`Er du sikker på at du vil rydde ALLE resultater for "${stageName}"?\n\nDette kan ikke fortrydes.`)) {
            if (DataManager.clearStageResults(raceId, stageId)) {
                this.viewRace(raceId);
            } else {
                alert('Fejl ved rydning af resultater');
            }
        }
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

    // CSV Export functions
    exportRiderStandingsCSV() {
        const game = DataManager.getCurrentGame();
        if (!game || game.riderStandings.length === 0) {
            alert('Ingen rytter data at eksportere.');
            return;
        }

        // Create CSV header
        let csv = 'Position,Rytter,Hold,World Tour Point,Sejre\n';

        // Sort by points (descending)
        const sortedRiders = [...game.riderStandings].sort((a, b) => b.worldTourPoints - a.worldTourPoints);

        // Add data rows
        sortedRiders.forEach((standing, index) => {
            const rider = DataManager.getRiderById(standing.riderId);
            const team = rider ? DataManager.getTeamById(rider.teamId) : null;
            const riderName = rider ? rider.name : 'Ukendt';
            const teamName = team ? team.name : 'Ukendt';

            csv += `${index + 1},"${riderName}","${teamName}",${standing.worldTourPoints},${standing.wins}\n`;
        });

        this.downloadCSV(csv, `${game.name}_rytter_stilling.csv`);
    },

    exportTeamStandingsCSV() {
        const game = DataManager.getCurrentGame();
        if (!game || game.teamStandings.length === 0) {
            alert('Ingen hold data at eksportere.');
            return;
        }

        // Create CSV header
        let csv = 'Position,Hold,Spiller,World Tour Point\n';

        // Sort by points (descending)
        const sortedTeams = [...game.teamStandings].sort((a, b) => b.worldTourPoints - a.worldTourPoints);

        // Add data rows
        sortedTeams.forEach((standing, index) => {
            const team = DataManager.getTeamById(standing.teamId);
            const player = team ? DataManager.getPlayerById(team.playerId) : null;
            const teamName = team ? team.name : 'Ukendt';
            const playerName = player ? player.name : 'Ukendt';

            csv += `${index + 1},"${teamName}","${playerName}",${standing.worldTourPoints}\n`;
        });

        this.downloadCSV(csv, `${game.name}_hold_stilling.csv`);
    },

    exportRaceResultsCSV(raceId) {
        const game = DataManager.getCurrentGame();
        const race = game.races.find(r => r.id === raceId);
        if (!race) {
            alert('Løb ikke fundet.');
            return;
        }

        let csv = '';

        if (race.type === 'one-day') {
            // One-day race export
            csv = 'Position,Rytter,Hold,Tid,Point\n';

            race.results.forEach(result => {
                const rider = DataManager.getRiderById(result.riderId);
                const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                const riderName = rider ? rider.name : 'Ukendt';
                const teamName = team ? team.name : 'Ukendt';

                csv += `${result.position},"${riderName}","${teamName}","${result.time}",${result.points}\n`;
            });
        } else if (race.type === 'stage') {
            // Stage race export - include GC
            csv = 'Type,Stage,Position,Rytter,Hold,Tid,Point\n';

            // Export each stage
            race.stages.forEach(stage => {
                stage.results.forEach(result => {
                    const rider = DataManager.getRiderById(result.riderId);
                    const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                    const riderName = rider ? rider.name : 'Ukendt';
                    const teamName = team ? team.name : 'Ukendt';

                    csv += `"Etape ${stage.stageNumber}","${stage.name}",${result.position},"${riderName}","${teamName}","${result.time}",${result.points}\n`;
                });
            });

            // Export GC
            if (race.generalClassification && race.generalClassification.length > 0) {
                race.generalClassification.forEach((gc, index) => {
                    const rider = DataManager.getRiderById(gc.riderId);
                    const team = rider ? DataManager.getTeamById(rider.teamId) : null;
                    const riderName = rider ? rider.name : 'Ukendt';
                    const teamName = team ? team.name : 'Ukendt';

                    csv += `"Samlet","General Classification",${index + 1},"${riderName}","${teamName}","${gc.totalTime}",${gc.totalPoints}\n`;
                });
            }
        }

        const filename = `${game.name}_${race.name}_resultater.csv`.replace(/[^a-z0-9_\-\.]/gi, '_');
        this.downloadCSV(csv, filename);
    },

    exportStatisticsCSV() {
        const game = DataManager.getCurrentGame();
        if (!game || game.riderStandings.length === 0) {
            alert('Ingen statistik data at eksportere.');
            return;
        }

        // Create CSV header
        let csv = 'Rytter,Hold,Point,Sejre,Løb Deltaget,Gns. Placering,Bedste Placering,Podier\n';

        // Calculate rider statistics (same logic as showStatisticsTab)
        const riderStats = game.riderStandings.map(standing => {
            const rider = DataManager.getRiderById(standing.riderId);
            const team = rider ? DataManager.getTeamById(rider.teamId) : null;

            let racesParticipated = 0;
            let totalPositions = 0;
            let bestPosition = Infinity;
            let podiums = 0;

            game.races.forEach(race => {
                if (race.type === 'one-day') {
                    const result = race.results.find(r => r.riderId === standing.riderId);
                    if (result) {
                        racesParticipated++;
                        totalPositions += result.position;
                        if (result.position < bestPosition) bestPosition = result.position;
                        if (result.position <= 3) podiums++;
                    }
                } else if (race.type === 'stage') {
                    let participatedInRace = false;
                    race.stages.forEach(stage => {
                        const result = stage.results.find(r => r.riderId === standing.riderId);
                        if (result && !participatedInRace) {
                            participatedInRace = true;
                            racesParticipated++;
                        }
                    });

                    if (race.generalClassification) {
                        const gcPosition = race.generalClassification.findIndex(gc => gc.riderId === standing.riderId);
                        if (gcPosition !== -1) {
                            const position = gcPosition + 1;
                            totalPositions += position;
                            if (position < bestPosition) bestPosition = position;
                            if (position <= 3) podiums++;
                        }
                    }
                }
            });

            const avgPosition = racesParticipated > 0 ? (totalPositions / racesParticipated).toFixed(1) : 'N/A';
            const bestPos = bestPosition === Infinity ? 'N/A' : bestPosition;

            return {
                riderName: rider ? rider.name : 'Ukendt',
                teamName: team ? team.name : 'Ukendt',
                points: standing.worldTourPoints,
                wins: standing.wins,
                races: racesParticipated,
                avgPosition: avgPosition,
                bestPosition: bestPos,
                podiums: podiums
            };
        });

        // Sort by points
        riderStats.sort((a, b) => b.points - a.points);

        // Add data rows
        riderStats.forEach(stat => {
            csv += `"${stat.riderName}","${stat.teamName}",${stat.points},${stat.wins},${stat.races},${stat.avgPosition},${stat.bestPosition},${stat.podiums}\n`;
        });

        this.downloadCSV(csv, `${game.name}_statistik.csv`);
    },

    downloadCSV(content, filename) {
        // Create a Blob with BOM for proper Excel encoding
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Create modal
    createModal(title, content, callback) {
        // Close any existing modals first
        this.closeModal();

        const modalHtml = `
            <div id="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="if(event.target.id === 'modal-overlay') UI.closeModal()">
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

        // Add ESC key handler
        this._escKeyHandler = (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        };
        document.addEventListener('keydown', this._escKeyHandler);

        // Call callback after modal is added to DOM
        if (callback && typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    },

    // Show modal (alias for createModal)
    showModal(content) {
        this.createModal('', content);
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.parentElement.remove();
        }

        // Remove ESC key handler
        if (this._escKeyHandler) {
            document.removeEventListener('keydown', this._escKeyHandler);
            this._escKeyHandler = null;
        }
    },

    // Update game info in header
    updateGameInfo() {
        const game = DataManager.getCurrentGame();
        if (game) {
            this.currentGameInfo.innerHTML = `Nuværende Spil: <strong>${game.name}</strong> | <a href="#" onclick="UI.showHome(); return false;" style="color: white;">Skift Spil</a> | <a href="#" onclick="UI.showSearch(); return false;" style="color: white;">🔍 Søg</a>`;
        } else {
            this.currentGameInfo.innerHTML = '';
        }
    },

    // Show search dialog
    showSearch() {
        this.showModal(`
            <h2>🔍 Søg</h2>
            <div class="form-group">
                <input type="text" id="search-input" placeholder="Søg efter rytter, hold eller løb..." style="width: 100%; padding: 10px; font-size: 1em;" oninput="UI.performSearch()">
            </div>
            <div id="search-results" style="max-height: 400px; overflow-y: auto;"></div>
        `);
        // Focus on search input
        setTimeout(() => {
            document.getElementById('search-input')?.focus();
        }, 100);
    },

    // Perform search
    performSearch() {
        const query = document.getElementById('search-input')?.value.trim().toLowerCase();
        const resultsDiv = document.getElementById('search-results');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = '<p style="color: #7f8c8d;">Indtast mindst 2 tegn for at søge...</p>';
            return;
        }

        const game = DataManager.getCurrentGame();
        let html = '';
        let foundResults = false;

        // Search riders
        const matchingRiders = [];
        game.teams.forEach(team => {
            if (team.riders) {
                team.riders.forEach(rider => {
                    if (rider.name.toLowerCase().includes(query)) {
                        matchingRiders.push({
                            rider: rider,
                            team: team,
                            standing: game.riderStandings.find(rs => rs.riderId === rider.id)
                        });
                    }
                });
            }
        });

        if (matchingRiders.length > 0) {
            foundResults = true;
            html += '<h3>Ryttere</h3>';
            html += '<ul style="list-style: none; padding: 0;">';
            matchingRiders.forEach(match => {
                const points = match.standing ? match.standing.worldTourPoints : 0;
                const wins = match.standing ? match.standing.wins : 0;
                html += `<li style="padding: 10px; border-bottom: 1px solid #ecf0f1; cursor: pointer;" onclick="UI.closeModal(); UI.showGameDashboard(); UI.showTab('standings');">`;
                html += `<strong>${match.rider.name}</strong> - ${match.team.name}<br>`;
                html += `<small style="color: #7f8c8d;">Point: ${points} | Sejre: ${wins}</small>`;
                html += `</li>`;
            });
            html += '</ul>';
        }

        // Search teams
        const matchingTeams = game.teams.filter(team => team.name.toLowerCase().includes(query));
        if (matchingTeams.length > 0) {
            foundResults = true;
            html += '<h3>Hold</h3>';
            html += '<ul style="list-style: none; padding: 0;">';
            matchingTeams.forEach(team => {
                const player = DataManager.getPlayerById(team.playerId);
                const standing = game.teamStandings.find(ts => ts.teamId === team.id);
                const points = standing ? standing.worldTourPoints : 0;
                html += `<li style="padding: 10px; border-bottom: 1px solid #ecf0f1; cursor: pointer;" onclick="UI.closeModal(); UI.showGameDashboard(); UI.showTab('players');">`;
                html += `<strong>${team.name}</strong> - ${player ? player.name : 'Ukendt'}<br>`;
                html += `<small style="color: #7f8c8d;">Point: ${points} | Ryttere: ${team.riders.length}</small>`;
                html += `</li>`;
            });
            html += '</ul>';
        }

        // Search races
        const matchingRaces = game.races.filter(race => race.name.toLowerCase().includes(query));
        if (matchingRaces.length > 0) {
            foundResults = true;
            html += '<h3>Løb</h3>';
            html += '<ul style="list-style: none; padding: 0;">';
            matchingRaces.forEach(race => {
                const date = race.date ? new Date(race.date).toLocaleDateString('da-DK') : '';
                html += `<li style="padding: 10px; border-bottom: 1px solid #ecf0f1; cursor: pointer;" onclick="UI.closeModal(); UI.viewRace('${race.id}');">`;
                html += `<strong>${race.name}</strong><br>`;
                html += `<small style="color: #7f8c8d;">${PointsCalculator.getRaceTypeName(race.type)}${date ? ' - ' + date : ''}</small>`;
                html += `</li>`;
            });
            html += '</ul>';
        }

        if (!foundResults) {
            html = '<p style="color: #e74c3c;">Ingen resultater fundet.</p>';
        }

        resultsDiv.innerHTML = html;
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
