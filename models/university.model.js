const mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    universityName: {
        type: String,
        required: 'This field is required.'
    }
});

mongoose.model('University', Schema);