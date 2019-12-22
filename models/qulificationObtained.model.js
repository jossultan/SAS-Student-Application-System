const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    overallScore: {
        type: Number,
        required: 'This field is required.'
    },
    qulificationId: {
        type: String,
        required: 'Minimum Score must be set.'
    },
    userId: {
        type: String,
        required: 'Miximum Score must be set.'
    }
});

mongoose.model('QualificationObtained', Schema);