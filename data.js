// Data Manager - handles all data operations and localStorage
const DataManager = {
    STORAGE_KEY: 'cyclingTourData',

    // Initialize data structure
    initData() {
        const data = this.loadData();
        if (!data) {
            const newData = {
                games: [],
                currentGameId: null
            };
            this.saveData(newData);
            return newData;
        }
        return data;
    },

    // Load data from localStorage
    loadData() {
        const json = localStorage.getItem(this.STORAGE_KEY);
        return json ? JSON.parse(json) : null;
    },

    // Save data to localStorage
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // Get current data
    getData() {
        return this.loadData() || this.initData();
    },

    // Get current game
    getCurrentGame() {
        const data = this.getData();
        if (!data.currentGameId) return null;
        return data.games.find(g => g.id === data.currentGameId);
    },

    // Set current game
    setCurrentGame(gameId) {
        const data = this.getData();
        data.currentGameId = gameId;
        this.saveData(data);
    },

    // Create new game
    createGame(gameName) {
        const data = this.getData();
        const game = {
            id: 'game-' + Date.now(),
            name: gameName,
            createdDate: new Date().toISOString(),
            players: [],
            teams: [],
            races: [],
            riderStandings: [],
            teamStandings: []
        };
        data.games.push(game);
        data.currentGameId = game.id;
        this.saveData(data);
        return game;
    },

    // Delete game
    deleteGame(gameId) {
        const data = this.getData();
        data.games = data.games.filter(g => g.id !== gameId);
        if (data.currentGameId === gameId) {
            data.currentGameId = null;
        }
        this.saveData(data);
    },

    // Add player to current game
    addPlayer(playerName) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const player = {
            id: 'player-' + Date.now(),
            name: playerName
        };
        game.players.push(player);
        this.saveData(data);
        return player;
    },

    // Add team to current game
    addTeam(teamName, playerId) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const team = {
            id: 'team-' + Date.now(),
            name: teamName,
            playerId: playerId,
            riders: []
        };
        game.teams.push(team);

        // Initialize team standings
        if (!game.teamStandings.find(t => t.teamId === team.id)) {
            game.teamStandings.push({
                teamId: team.id,
                worldTourPoints: 0
            });
        }

        this.saveData(data);
        return team;
    },

    // Add rider to team
    addRider(riderName, teamId) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const team = game.teams.find(t => t.id === teamId);
        if (!team) return null;

        const rider = {
            id: 'rider-' + Date.now(),
            name: riderName,
            teamId: teamId
        };
        team.riders.push(rider);

        // Initialize rider standings
        if (!game.riderStandings.find(r => r.riderId === rider.id)) {
            game.riderStandings.push({
                riderId: rider.id,
                worldTourPoints: 0,
                wins: 0
            });
        }

        this.saveData(data);
        return rider;
    },

    // Create race
    createRace(raceName, raceType, raceFormat) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const race = {
            id: 'race-' + Date.now(),
            name: raceName,
            type: raceType, // 'tour-de-france', 'giro', 'vuelta', 'monument', 'worldcup-major', 'worldcup-other'
            raceFormat: raceFormat, // 'one-day' or 'stage'
            createdDate: new Date().toISOString(),
            stages: raceFormat === 'stage' ? [] : null,
            results: raceFormat === 'one-day' ? [] : null,
            generalClassification: raceFormat === 'stage' ? [] : null,
            pointsClassification: raceFormat === 'stage' ? [] : null,
            mountainClassification: raceFormat === 'stage' ? [] : null,
            yellowJerseyDays: raceFormat === 'stage' ? {} : null
        };
        game.races.push(race);
        this.saveData(data);
        return race;
    },

    // Add stage to race
    addStage(raceId, stageName, stageNumber) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return null;

        const stage = {
            id: 'stage-' + Date.now(),
            name: stageName,
            stageNumber: stageNumber,
            results: []
        };
        race.stages.push(stage);
        this.saveData(data);
        return stage;
    },

    // Add stage result
    addStageResult(raceId, stageId, riderId, time, position, sprintPoints = 0, mountainPoints = 0) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        // Remove existing result for this rider if any
        stage.results = stage.results.filter(r => r.riderId !== riderId);

        const result = {
            riderId: riderId,
            time: time,
            position: position,
            sprintPoints: sprintPoints,
            mountainPoints: mountainPoints
        };
        stage.results.push(result);

        // Recalculate classifications
        this.recalculateClassifications(raceId);

        this.saveData(data);
        return result;
    },

    // Add one-day race result
    addOneDayResult(raceId, riderId, time, position) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'one-day') return null;

        // Remove existing result for this rider if any
        race.results = race.results.filter(r => r.riderId !== riderId);

        const result = {
            riderId: riderId,
            time: time,
            position: position
        };
        race.results.push(result);

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
        return result;
    },

    // Recalculate classifications for stage race
    recalculateClassifications(raceId) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return;

        // Calculate general classification (total time)
        const gcMap = new Map();
        race.stages.forEach(stage => {
            stage.results.forEach(result => {
                const currentTime = gcMap.get(result.riderId) || 0;
                gcMap.set(result.riderId, currentTime + this.parseTime(result.time));
            });
        });

        race.generalClassification = Array.from(gcMap.entries())
            .map(([riderId, totalTime]) => ({ riderId, totalTime }))
            .sort((a, b) => a.totalTime - b.totalTime)
            .map((item, index) => ({ ...item, position: index + 1 }));

        // Calculate points classification (sprint points)
        const pointsMap = new Map();
        race.stages.forEach(stage => {
            stage.results.forEach(result => {
                const currentPoints = pointsMap.get(result.riderId) || 0;
                pointsMap.set(result.riderId, currentPoints + (result.sprintPoints || 0));
            });
        });

        race.pointsClassification = Array.from(pointsMap.entries())
            .map(([riderId, points]) => ({ riderId, points }))
            .sort((a, b) => b.points - a.points)
            .map((item, index) => ({ ...item, position: index + 1 }));

        // Calculate mountain classification (mountain points)
        const mountainMap = new Map();
        race.stages.forEach(stage => {
            stage.results.forEach(result => {
                const currentPoints = mountainMap.get(result.riderId) || 0;
                mountainMap.set(result.riderId, currentPoints + (result.mountainPoints || 0));
            });
        });

        race.mountainClassification = Array.from(mountainMap.entries())
            .map(([riderId, points]) => ({ riderId, points }))
            .sort((a, b) => b.points - a.points)
            .map((item, index) => ({ ...item, position: index + 1 }));

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
    },

    // Set yellow jersey days for a rider
    setYellowJerseyDays(raceId, riderId, days) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return;

        race.yellowJerseyDays[riderId] = days;

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
    },

    // Recalculate all world tour points
    recalculateWorldTourPoints() {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return;

        // Reset all points
        game.riderStandings.forEach(standing => {
            standing.worldTourPoints = 0;
            standing.wins = 0;
        });
        game.teamStandings.forEach(standing => {
            standing.worldTourPoints = 0;
        });

        // Calculate points from all races
        game.races.forEach(race => {
            if (race.raceFormat === 'one-day') {
                // One-day race points
                race.results.forEach(result => {
                    const points = PointsCalculator.getOneDayRacePoints(race.type, result.position);
                    this.addPointsToRider(result.riderId, points, result.position === 1);
                });
            } else if (race.raceFormat === 'stage') {
                // Stage race - general classification points
                race.generalClassification.forEach(gc => {
                    const points = PointsCalculator.getGCPoints(race.type, gc.position);
                    this.addPointsToRider(gc.riderId, points, gc.position === 1);
                });

                // Points classification
                race.pointsClassification.forEach(pc => {
                    const points = PointsCalculator.getJerseyPoints(race.type, pc.position, 'points');
                    this.addPointsToRider(pc.riderId, points, false);
                });

                // Mountain classification
                race.mountainClassification.forEach(mc => {
                    const points = PointsCalculator.getJerseyPoints(race.type, mc.position, 'mountain');
                    this.addPointsToRider(mc.riderId, points, false);
                });

                // Stage wins
                race.stages.forEach(stage => {
                    stage.results.forEach(result => {
                        const points = PointsCalculator.getStagePoints(race.type, result.position);
                        this.addPointsToRider(result.riderId, points, result.position === 1);
                    });
                });

                // Yellow jersey bonus points
                Object.entries(race.yellowJerseyDays || {}).forEach(([riderId, days]) => {
                    const bonusPoints = PointsCalculator.getYellowJerseyBonus(race.type, days);
                    this.addPointsToRider(riderId, bonusPoints, false);
                });
            }
        });

        this.saveData(data);
    },

    // Helper: Add points to rider and their team
    addPointsToRider(riderId, points, isWin) {
        const data = this.getData();
        const game = this.getCurrentGame();
        if (!game) return;

        // Add to rider
        let riderStanding = game.riderStandings.find(r => r.riderId === riderId);
        if (!riderStanding) {
            riderStanding = { riderId: riderId, worldTourPoints: 0, wins: 0 };
            game.riderStandings.push(riderStanding);
        }
        riderStanding.worldTourPoints += points;
        if (isWin) riderStanding.wins++;

        // Add to team
        const rider = this.getRiderById(riderId);
        if (rider) {
            let teamStanding = game.teamStandings.find(t => t.teamId === rider.teamId);
            if (!teamStanding) {
                teamStanding = { teamId: rider.teamId, worldTourPoints: 0 };
                game.teamStandings.push(teamStanding);
            }
            teamStanding.worldTourPoints += points;
        }
    },

    // Helper: Parse time string (HH:MM:SS or MM:SS) to seconds
    parseTime(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return 0;
    },

    // Helper: Format seconds to time string
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    },

    // Get rider by ID
    getRiderById(riderId) {
        const game = this.getCurrentGame();
        if (!game) return null;

        for (const team of game.teams) {
            const rider = team.riders.find(r => r.id === riderId);
            if (rider) return rider;
        }
        return null;
    },

    // Get team by ID
    getTeamById(teamId) {
        const game = this.getCurrentGame();
        if (!game) return null;
        return game.teams.find(t => t.id === teamId);
    },

    // Get player by ID
    getPlayerById(playerId) {
        const game = this.getCurrentGame();
        if (!game) return null;
        return game.players.find(p => p.id === playerId);
    },

    // Get race by ID
    getRaceById(raceId) {
        const game = this.getCurrentGame();
        if (!game) return null;
        return game.races.find(r => r.id === raceId);
    },

    // Get all riders in game
    getAllRiders() {
        const game = this.getCurrentGame();
        if (!game) return [];

        const riders = [];
        game.teams.forEach(team => {
            team.riders.forEach(rider => {
                riders.push(rider);
            });
        });
        return riders;
    },

    // Export all data as JSON file
    exportData() {
        const data = this.getData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `cykel-tour-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    },

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate data structure
                    if (!importedData.games || !Array.isArray(importedData.games)) {
                        reject(new Error('Ugyldig data format'));
                        return;
                    }

                    // Ask for confirmation before overwriting
                    const currentData = this.getData();
                    if (currentData.games.length > 0) {
                        const confirm = window.confirm(
                            'ADVARSEL: Dette vil overskrive alle eksisterende data!\n\n' +
                            `Nuværende data: ${currentData.games.length} spil\n` +
                            `Import data: ${importedData.games.length} spil\n\n` +
                            'Fortsæt?'
                        );

                        if (!confirm) {
                            reject(new Error('Import annulleret af bruger'));
                            return;
                        }
                    }

                    // Save imported data
                    this.saveData(importedData);
                    resolve(importedData);
                } catch (error) {
                    reject(new Error('Kunne ikke læse filen: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Fejl ved læsning af fil'));
            };

            reader.readAsText(file);
        });
    },

    // Merge imported data with existing data (instead of overwriting)
    mergeImportData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate data structure
                    if (!importedData.games || !Array.isArray(importedData.games)) {
                        reject(new Error('Ugyldig data format'));
                        return;
                    }

                    const currentData = this.getData();

                    // Merge games (add new ones, skip duplicates by ID)
                    importedData.games.forEach(importedGame => {
                        const exists = currentData.games.find(g => g.id === importedGame.id);
                        if (!exists) {
                            currentData.games.push(importedGame);
                        }
                    });

                    this.saveData(currentData);
                    resolve(currentData);
                } catch (error) {
                    reject(new Error('Kunne ikke læse filen: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Fejl ved læsning af fil'));
            };

            reader.readAsText(file);
        });
    }
};
