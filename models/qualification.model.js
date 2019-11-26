const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    qualificationName: {
        type: String,
        required: 'This field is required.'
    },
    minimumScore: {
        type: Number,
        required: 'Minimum Score must be set.'
    },
    maximumScore: {
        type: Number,
        required: 'Miximum Score must be set.'
    },
    resultCalcDescription: {
        type: String,
        required: 'This field is required.'
    },
    gradeList: {
        type: String,
        required: 'This field is required.'
    },
});

mongoose.model('Qualification', Schema);