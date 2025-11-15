// Points Calculator - UCI Point System 1997
const PointsCalculator = {
    // Tour de France points
    TOUR_DE_FRANCE: {
        gc: [130, 104, 88, 68, 48, 28, 8],
        jersey: [21, 15, 11],
        stage: [21, 15, 11, 9, 7],
        yellowJerseyBonus: 8
    },

    // Giro d'Italia & Vuelta a España points
    GIRO_VUELTA: {
        gc: [85, 68, 57, 43, 29, 15, 1],
        jersey: [18, 13, 10],
        stage: [18, 13, 10, 8, 6],
        yellowJerseyBonus: 6
    },

    // Monument races
    MONUMENT: [80, 64, 52, 44, 36, 28, 20, 12, 4],

    // Major World Cup races
    WORLDCUP_MAJOR: [50, 40, 33, 28, 23, 18, 13, 8, 3],

    // Other World Cup races
    WORLDCUP_OTHER: [40, 32, 26, 22, 18, 14, 10, 6, 2],

    // Get points for one-day race
    getOneDayRacePoints(raceType, position) {
        let pointsArray;

        switch(raceType) {
            case 'monument':
                pointsArray = this.MONUMENT;
                break;
            case 'worldcup-major':
                pointsArray = this.WORLDCUP_MAJOR;
                break;
            case 'worldcup-other':
                pointsArray = this.WORLDCUP_OTHER;
                break;
            default:
                return 0;
        }

        return pointsArray[position - 1] || 0;
    },

    // Get points for general classification
    getGCPoints(raceType, position) {
        let pointsArray;

        switch(raceType) {
            case 'tour-de-france':
                pointsArray = this.TOUR_DE_FRANCE.gc;
                break;
            case 'giro':
            case 'vuelta':
                pointsArray = this.GIRO_VUELTA.gc;
                break;
            default:
                return 0;
        }

        return pointsArray[position - 1] || 0;
    },

    // Get points for jersey (points/mountain classification)
    getJerseyPoints(raceType, position, jerseyType) {
        let pointsArray;

        switch(raceType) {
            case 'tour-de-france':
                pointsArray = this.TOUR_DE_FRANCE.jersey;
                break;
            case 'giro':
            case 'vuelta':
                pointsArray = this.GIRO_VUELTA.jersey;
                break;
            default:
                return 0;
        }

        return pointsArray[position - 1] || 0;
    },

    // Get points for stage win
    getStagePoints(raceType, position) {
        let pointsArray;

        switch(raceType) {
            case 'tour-de-france':
                pointsArray = this.TOUR_DE_FRANCE.stage;
                break;
            case 'giro':
            case 'vuelta':
                pointsArray = this.GIRO_VUELTA.stage;
                break;
            default:
                return 0;
        }

        return pointsArray[position - 1] || 0;
    },

    // Get bonus points for yellow jersey days
    getYellowJerseyBonus(raceType, days) {
        let bonusPerDay;

        switch(raceType) {
            case 'tour-de-france':
                bonusPerDay = this.TOUR_DE_FRANCE.yellowJerseyBonus;
                break;
            case 'giro':
            case 'vuelta':
                bonusPerDay = this.GIRO_VUELTA.yellowJerseyBonus;
                break;
            default:
                return 0;
        }

        return bonusPerDay * days;
    },

    // Get race type display name
    getRaceTypeName(raceType) {
        const names = {
            'tour-de-france': 'Tour de France',
            'giro': 'Giro d\'Italia',
            'vuelta': 'Vuelta a España',
            'monument': 'Monument',
            'worldcup-major': 'World Cup (Major)',
            'worldcup-other': 'World Cup (Øvrige)'
        };
        return names[raceType] || raceType;
    }
};
