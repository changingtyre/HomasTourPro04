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
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            console.log('loadData: Retrieved from localStorage:', json ? json.substring(0, 100) + '...' : 'null');
            return json ? JSON.parse(json) : null;
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            alert('FEJL: Kan ikke læse data fra localStorage. Måske bruger du file:// protokol? Prøv at åbne via en webserver.');
            return null;
        }
    },

    // Save data to localStorage
    saveData(data) {
        try {
            const jsonString = JSON.stringify(data);
            console.log('saveData: Saving to localStorage:', jsonString.substring(0, 100) + '...');
            localStorage.setItem(this.STORAGE_KEY, jsonString);
            console.log('saveData: Successfully saved to localStorage');

            // Verify it was saved
            const verify = localStorage.getItem(this.STORAGE_KEY);
            if (!verify) {
                throw new Error('Data was not saved to localStorage!');
            }
            console.log('saveData: Verified data was saved');
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            alert('KRITISK FEJL: Kan ikke gemme data!\n\n' +
                  'Dette sker ofte når du åbner HTML filen direkte (file://).\n\n' +
                  'Løsning:\n' +
                  '1. Brug Python: python -m http.server 8000\n' +
                  '2. Eller brug anden webserver\n' +
                  '3. Åbn derefter http://localhost:8000');
            throw error;
        }
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
        console.log('DataManager.addPlayer called with:', playerName);
        const data = this.getData();
        console.log('Current data:', data);

        if (!data.currentGameId) {
            console.error('No current game ID!');
            return null;
        }

        // Find game directly in the data object (not via getCurrentGame)
        const game = data.games.find(g => g.id === data.currentGameId);
        console.log('Current game:', game);

        if (!game) {
            console.error('No current game found!');
            return null;
        }

        const player = {
            id: 'player-' + Date.now(),
            name: playerName
        };
        console.log('Created player:', player);

        game.players.push(player);
        console.log('Game after adding player:', game);
        console.log('Data object games:', data.games);

        this.saveData(data);
        console.log('Data saved successfully');

        return player;
    },

    // Add team to current game
    addTeam(teamName, playerId, color = '#3498db') {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const team = {
            id: 'team-' + Date.now(),
            name: teamName,
            playerId: playerId,
            riders: [],
            color: color || '#3498db'  // Default blue color
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

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
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

    // Delete player
    deletePlayer(playerId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        // Delete all teams belonging to this player (and their riders)
        const playerTeams = game.teams.filter(t => t.playerId === playerId);
        playerTeams.forEach(team => {
            this.deleteTeam(team.id);
        });

        // Remove player
        game.players = game.players.filter(p => p.id !== playerId);

        this.saveData(data);
        return true;
    },

    // Edit player name
    editPlayer(playerId, newName) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const player = game.players.find(p => p.id === playerId);
        if (!player) return false;

        player.name = newName;
        this.saveData(data);
        return true;
    },

    // Delete team
    deleteTeam(teamId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const team = game.teams.find(t => t.id === teamId);
        if (!team) return false;

        // Delete all riders in this team
        team.riders.forEach(rider => {
            // Remove rider standings
            game.riderStandings = game.riderStandings.filter(r => r.riderId !== rider.id);
        });

        // Remove team standings
        game.teamStandings = game.teamStandings.filter(t => t.teamId !== teamId);

        // Remove team
        game.teams = game.teams.filter(t => t.id !== teamId);

        this.saveData(data);
        return true;
    },

    // Edit team name
    editTeam(teamId, newName) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const team = game.teams.find(t => t.id === teamId);
        if (!team) return false;

        team.name = newName;
        this.saveData(data);
        return true;
    },

    // Delete rider
    deleteRider(riderId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        // Find which team the rider belongs to
        const team = game.teams.find(t => t.riders.some(r => r.id === riderId));
        if (!team) return false;

        // Remove rider from team
        team.riders = team.riders.filter(r => r.id !== riderId);

        // Remove rider standings
        game.riderStandings = game.riderStandings.filter(r => r.riderId !== riderId);

        this.saveData(data);
        return true;
    },

    // Edit rider name
    editRider(riderId, newName) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        // Find which team the rider belongs to
        const team = game.teams.find(t => t.riders.some(r => r.id === riderId));
        if (!team) return false;

        const rider = team.riders.find(r => r.id === riderId);
        if (!rider) return false;

        rider.name = newName;
        this.saveData(data);
        return true;
    },

    // Create race
    createRace(raceName, raceType, raceFormat, raceDate = null) {
        console.log('DataManager.createRace called with:', raceName, raceType, raceFormat, raceDate);
        const data = this.getData();
        console.log('Current data:', data);

        if (!data.currentGameId) {
            console.error('No current game ID!');
            return null;
        }

        // Find game directly in the data object
        const game = data.games.find(g => g.id === data.currentGameId);
        console.log('Current game:', game);

        if (!game) {
            console.error('No current game found!');
            return null;
        }

        const race = {
            id: 'race-' + Date.now(),
            name: raceName,
            type: raceType, // 'tour-de-france', 'giro', 'vuelta', 'monument', 'worldcup-major', 'worldcup-other'
            raceFormat: raceFormat, // 'one-day' or 'stage'
            date: raceDate || null, // Original race date (optional)
            createdDate: new Date().toISOString(),
            stages: raceFormat === 'stage' ? [] : null,
            results: raceFormat === 'one-day' ? [] : null,
            generalClassification: raceFormat === 'stage' ? [] : null,
            pointsClassification: raceFormat === 'stage' ? [] : null,
            mountainClassification: raceFormat === 'stage' ? [] : null,
            teamClassification: raceFormat === 'stage' ? [] : null,
            yellowJerseyDays: raceFormat === 'stage' ? {} : null
        };
        console.log('Created race:', race);

        game.races.push(race);
        console.log('Game after adding race:', game);
        console.log('Data object games:', data.games);

        this.saveData(data);
        console.log('Data saved successfully. Race ID:', race.id);

        return race;
    },

    // Delete race
    deleteRace(raceId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        // Remove race from game
        game.races = game.races.filter(r => r.id !== raceId);

        // Recalculate world tour points after deleting race
        this.saveData(data);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Edit race
    editRace(raceId, newName, newType, newDate = null) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return false;

        race.name = newName;
        race.type = newType;
        race.date = newDate || null;

        this.saveData(data);

        // If race type changed, recalculate points
        this.recalculateWorldTourPoints();

        return true;
    },

    // Update race notes
    updateRaceNotes(raceId, notes) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return false;

        race.notes = notes || null;

        this.saveData(data);
        return true;
    },

    // Add stage to race
    addStage(raceId, stageName, stageNumber, stageType = 'flat', finishOnMountain = false, finishMountainCategory = null) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return null;

        const stage = {
            id: 'stage-' + Date.now(),
            name: stageName,
            stageNumber: stageNumber,
            stageType: stageType, // 'flat', 'hilly', or 'mountain'
            finishOnMountain: finishOnMountain, // true if stage finishes on a mountain
            finishMountainCategory: finishMountainCategory, // 'cat4', 'cat3', 'cat2', 'cat1', or 'hc'
            results: [],
            mountains: [], // Array of {id, name, category, results: [{riderId, position}]}
            sprints: [] // Array of {id, name, results: [{riderId, position}]}
        };
        race.stages.push(stage);
        this.saveData(data);
        return stage;
    },

    // Delete stage
    deleteStage(raceId, stageId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return false;

        // Remove stage from race
        race.stages = race.stages.filter(s => s.id !== stageId);

        // Save the deletion first
        this.saveData(data);

        // Recalculate classifications and world tour points after deleting stage
        this.recalculateClassifications(raceId);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Edit stage
    editStage(raceId, stageId, newName, newStageNumber, newStageType, finishOnMountain, finishMountainCategory) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return false;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return false;

        stage.name = newName;
        stage.stageNumber = newStageNumber;
        stage.stageType = newStageType;
        stage.finishOnMountain = finishOnMountain;
        stage.finishMountainCategory = finishMountainCategory;

        this.saveData(data);

        // Recalculate in case stage type affects points
        this.recalculateClassifications(raceId);

        return true;
    },

    // Add stage result
    addStageResult(raceId, stageId, riderId, time, position, sprintPoints = 0, mountainPoints = 0) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
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

        // Save the stage result first
        this.saveData(data);

        // Recalculate classifications (this will save again with updated classifications)
        this.recalculateClassifications(raceId);

        return result;
    },

    // Add multiple stage results at once
    addBatchStageResults(raceId, stageId, results) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        // Clear all existing results
        stage.results = [];

        // Add all new results (only time and position, points are calculated from sprints/mountains)
        results.forEach(result => {
            if (result.riderId && result.time && result.position) {
                stage.results.push({
                    riderId: result.riderId,
                    time: result.time,
                    position: result.position
                });
            }
        });

        // Save the stage results first
        this.saveData(data);

        // Recalculate classifications (this will save again with updated classifications)
        this.recalculateClassifications(raceId);

        return stage.results;
    },

    // Add one-day race result
    addOneDayResult(raceId, riderId, time, position) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
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

    // Add multiple one-day race results at once
    addBatchOneDayResults(raceId, results) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'one-day') return null;

        // Clear all existing results
        race.results = [];

        // Add all new results
        results.forEach(result => {
            if (result.riderId && result.time && result.position) {
                race.results.push({
                    riderId: result.riderId,
                    time: result.time,
                    position: result.position
                });
            }
        });

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
        return race.results;
    },

    // Delete stage result (single rider)
    deleteStageResult(raceId, stageId, riderId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return false;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return false;

        // Remove result for this rider
        stage.results = stage.results.filter(r => r.riderId !== riderId);

        // Save the deletion first
        this.saveData(data);

        // Recalculate classifications and world tour points
        this.recalculateClassifications(raceId);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Delete one-day result (single rider)
    deleteOneDayResult(raceId, riderId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'one-day') return false;

        // Remove result for this rider
        race.results = race.results.filter(r => r.riderId !== riderId);

        // Recalculate world tour points
        this.saveData(data);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Clear all stage results
    clearStageResults(raceId, stageId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return false;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return false;

        // Clear all results
        stage.results = [];

        // Recalculate classifications and world tour points
        this.saveData(data);
        this.recalculateClassifications(raceId);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Clear all one-day results
    clearOneDayResults(raceId) {
        const data = this.getData();
        if (!data.currentGameId) return false;

        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return false;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'one-day') return false;

        // Clear all results
        race.results = [];

        // Recalculate world tour points
        this.saveData(data);
        this.recalculateWorldTourPoints();

        return true;
    },

    // Add mountain to stage
    addMountain(raceId, stageId, mountainName, category) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        // Initialize mountains array if it doesn't exist (for old races created before this feature)
        if (!stage.mountains) {
            stage.mountains = [];
        }

        const mountain = {
            id: 'mountain-' + Date.now(),
            name: mountainName,
            category: category, // 'cat4', 'cat3', 'cat2', 'cat1', or 'hc'
            results: [] // [{riderId, position}]
        };

        stage.mountains.push(mountain);
        this.saveData(data);
        return mountain;
    },

    // Add sprint to stage
    addSprint(raceId, stageId, sprintName) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        // Initialize sprints array if it doesn't exist (for old races created before this feature)
        if (!stage.sprints) {
            stage.sprints = [];
        }

        const sprint = {
            id: 'sprint-' + Date.now(),
            name: sprintName,
            results: [] // [{riderId, position}]
        };

        stage.sprints.push(sprint);
        this.saveData(data);
        return sprint;
    },

    // Add results to mountain
    addMountainResults(raceId, stageId, mountainId, results) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        const mountain = stage.mountains.find(m => m.id === mountainId);
        if (!mountain) return null;

        mountain.results = results; // [{riderId, position}]

        this.recalculateClassifications(raceId);
        this.saveData(data);
        return mountain.results;
    },

    // Add results to sprint
    addSprintResults(raceId, stageId, sprintId, results) {
        const data = this.getData();

        if (!data.currentGameId) return null;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return null;

        const race = game.races.find(r => r.id === raceId);
        if (!race) return null;

        const stage = race.stages.find(s => s.id === stageId);
        if (!stage) return null;

        const sprint = stage.sprints.find(s => s.id === sprintId);
        if (!sprint) return null;

        sprint.results = results; // [{riderId, position}]

        this.recalculateClassifications(raceId);
        this.saveData(data);
        return sprint.results;
    },

    // Recalculate classifications for stage race
    recalculateClassifications(raceId) {
        const data = this.getData();

        if (!data.currentGameId) return;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return;

        console.log('Recalculating classifications for race:', race.name);

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
            // Points from stage finish
            if (stage.results && stage.results.length > 0) {
                stage.results.forEach(result => {
                    const stageType = stage.stageType || 'flat';
                    const finishPoints = PointsCalculator.getStageFinishPoints(stageType, result.position);
                    const currentPoints = pointsMap.get(result.riderId) || 0;
                    pointsMap.set(result.riderId, currentPoints + finishPoints);
                });
            }

            // Points from intermediate sprints
            if (stage.sprints) {
                stage.sprints.forEach(sprint => {
                    if (sprint.results) {
                        sprint.results.forEach(result => {
                            const sprintPoints = PointsCalculator.getIntermediateSprintPoints(result.position);
                            const currentPoints = pointsMap.get(result.riderId) || 0;
                            pointsMap.set(result.riderId, currentPoints + sprintPoints);
                        });
                    }
                });
            }
        });

        race.pointsClassification = Array.from(pointsMap.entries())
            .map(([riderId, points]) => ({ riderId, points }))
            .sort((a, b) => b.points - a.points)
            .map((item, index) => ({ ...item, position: index + 1 }));

        // Calculate mountain classification (mountain points)
        const mountainMap = new Map();
        race.stages.forEach(stage => {
            // Points from mountains during the stage
            if (stage.mountains) {
                stage.mountains.forEach(mountain => {
                    if (mountain.results) {
                        mountain.results.forEach(result => {
                            const mountainPoints = PointsCalculator.getMountainPoints(mountain.category, result.position);
                            const currentPoints = mountainMap.get(result.riderId) || 0;
                            mountainMap.set(result.riderId, currentPoints + mountainPoints);
                        });
                    }
                });
            }

            // Points from stage finish if it's on a mountain
            if (stage.finishOnMountain && stage.finishMountainCategory && stage.results && stage.results.length > 0) {
                stage.results.forEach(result => {
                    const mountainPoints = PointsCalculator.getMountainPoints(stage.finishMountainCategory, result.position);
                    const currentPoints = mountainMap.get(result.riderId) || 0;
                    mountainMap.set(result.riderId, currentPoints + mountainPoints);
                });
            }
        });

        race.mountainClassification = Array.from(mountainMap.entries())
            .map(([riderId, points]) => ({ riderId, points }))
            .sort((a, b) => b.points - a.points)
            .map((item, index) => ({ ...item, position: index + 1 }));

        console.log('Points classification:', race.pointsClassification.length, 'riders');
        console.log('Mountain classification:', race.mountainClassification.length, 'riders');

        // Calculate team classification (sum of times for first 3 riders from each team on each stage)
        const teamTimeMap = new Map();

        // Get all teams in the game
        game.teams.forEach(team => {
            teamTimeMap.set(team.id, 0);
        });

        race.stages.forEach(stage => {
            if (stage.results && stage.results.length > 0) {
                // Group riders by team for this stage
                const teamRidersMap = new Map();

                stage.results.forEach(result => {
                    // Find which team this rider belongs to
                    let riderTeamId = null;
                    for (const team of game.teams) {
                        const rider = team.riders.find(r => r.id === result.riderId);
                        if (rider) {
                            riderTeamId = team.id;
                            break;
                        }
                    }

                    if (riderTeamId) {
                        if (!teamRidersMap.has(riderTeamId)) {
                            teamRidersMap.set(riderTeamId, []);
                        }
                        teamRidersMap.get(riderTeamId).push({
                            riderId: result.riderId,
                            time: this.parseTime(result.time),
                            position: result.position
                        });
                    }
                });

                // For each team, sum the times of the first 3 riders
                teamRidersMap.forEach((riders, teamId) => {
                    // Sort by position (lower is better)
                    riders.sort((a, b) => a.position - b.position);

                    // Take first 3 riders
                    const top3Riders = riders.slice(0, 3);

                    // Sum their times
                    const stageTeamTime = top3Riders.reduce((sum, rider) => sum + rider.time, 0);

                    // Add to total team time
                    const currentTotalTime = teamTimeMap.get(teamId) || 0;
                    teamTimeMap.set(teamId, currentTotalTime + stageTeamTime);
                });
            }
        });

        race.teamClassification = Array.from(teamTimeMap.entries())
            .filter(([teamId, totalTime]) => totalTime > 0) // Only include teams with results
            .map(([teamId, totalTime]) => ({ teamId, totalTime }))
            .sort((a, b) => a.totalTime - b.totalTime)
            .map((item, index) => ({ ...item, position: index + 1 }));

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
    },

    // Set yellow jersey days for a rider
    setYellowJerseyDays(raceId, riderId, days) {
        const data = this.getData();

        if (!data.currentGameId) return;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return;

        const race = game.races.find(r => r.id === raceId);
        if (!race || race.raceFormat !== 'stage') return;

        race.yellowJerseyDays[riderId] = days;

        // Recalculate world tour points
        this.recalculateWorldTourPoints();

        this.saveData(data);
    },

    // Recalculate all races (used on startup to fix old data)
    recalculateAllRaces() {
        const data = this.getData();

        if (!data.currentGameId) return;
        const game = data.games.find(g => g.id === data.currentGameId);
        if (!game) return;

        console.log('Recalculating all races for game:', game.name);

        // Recalculate all stage race classifications
        game.races.forEach(race => {
            if (race.raceFormat === 'stage' && race.stages.length > 0) {
                console.log('Recalculating stage race:', race.name);
                this.recalculateClassifications(race.id);
            }
        });

        // Recalculate world tour points for all races
        this.recalculateWorldTourPoints();

        console.log('All races recalculated successfully');
    },

    // Recalculate all world tour points
    recalculateWorldTourPoints() {
        const data = this.getData();

        if (!data.currentGameId) return;
        const game = data.games.find(g => g.id === data.currentGameId);
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
                    this.addPointsToRider(game, result.riderId, points, result.position === 1);
                });
            } else if (race.raceFormat === 'stage') {
                // Stage race - general classification points
                race.generalClassification.forEach(gc => {
                    const points = PointsCalculator.getGCPoints(race.type, gc.position);
                    this.addPointsToRider(game, gc.riderId, points, gc.position === 1);
                });

                // Points classification
                race.pointsClassification.forEach(pc => {
                    const points = PointsCalculator.getJerseyPoints(race.type, pc.position, 'points');
                    this.addPointsToRider(game, pc.riderId, points, false);
                });

                // Mountain classification
                race.mountainClassification.forEach(mc => {
                    const points = PointsCalculator.getJerseyPoints(race.type, mc.position, 'mountain');
                    this.addPointsToRider(game, mc.riderId, points, false);
                });

                // Stage wins
                race.stages.forEach(stage => {
                    stage.results.forEach(result => {
                        const points = PointsCalculator.getStagePoints(race.type, result.position);
                        this.addPointsToRider(game, result.riderId, points, result.position === 1);
                    });
                });

                // Yellow jersey bonus points
                Object.entries(race.yellowJerseyDays || {}).forEach(([riderId, days]) => {
                    const bonusPoints = PointsCalculator.getYellowJerseyBonus(race.type, days);
                    this.addPointsToRider(game, riderId, bonusPoints, false);
                });
            }
        });

        this.saveData(data);
    },

    // Helper: Add points to rider and their team
    addPointsToRider(game, riderId, points, isWin) {
        if (!game) return;

        // Add to rider
        let riderStanding = game.riderStandings.find(r => r.riderId === riderId);
        if (!riderStanding) {
            riderStanding = { riderId: riderId, worldTourPoints: 0, wins: 0 };
            game.riderStandings.push(riderStanding);
        }
        riderStanding.worldTourPoints += points;
        if (isWin) riderStanding.wins++;

        // Add to team - find rider directly in game's teams
        let rider = null;
        for (const team of game.teams) {
            const foundRider = team.riders.find(r => r.id === riderId);
            if (foundRider) {
                rider = foundRider;
                break;
            }
        }

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

    // Validate time format
    validateTimeFormat(timeString) {
        if (!timeString || timeString.trim() === '') {
            return { valid: false, error: 'Tid må ikke være tom' };
        }

        const trimmed = timeString.trim();

        // Accept formats: HH:MM:SS, MM:SS, or SS
        const patterns = [
            /^(\d{1,2}):([0-5]\d):([0-5]\d)$/,  // HH:MM:SS
            /^([0-5]\d):([0-5]\d)$/,             // MM:SS
            /^([0-5]?\d)$/                       // SS
        ];

        for (const pattern of patterns) {
            if (pattern.test(trimmed)) {
                return { valid: true, formatted: trimmed };
            }
        }

        return {
            valid: false,
            error: 'Ugyldigt tidsformat. Brug HH:MM:SS, MM:SS eller SS'
        };
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
