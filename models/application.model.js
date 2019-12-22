const mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    applicationDate:{
        type: Date,
        required: 'This field is required.'
    },
    status: {
        type: String
    },
    userId:{
        type: String
    },
    programmeId:{
        type: String
    }
});

mongoose.model('Application', Schema);