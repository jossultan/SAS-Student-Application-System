const mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: 'This field is required.'
    },
    grades: {
        type: String
    },
    score: {
        type: Number
    },
    qualificationObtained:{
        type: String
    }
});

mongoose.model('Result', Schema);