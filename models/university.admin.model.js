const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    userName: {
        type: String,
        required: 'This field is required.'
    },
    password: {
        type: String,
        required: 'This field is required.'
    },
    name: {
        type: String,
        required: 'this value must be set.'
    },
    email: {
        type: String,
        required: 'This field is required.'
    },
    universityID:{
        type: String
    }
});

mongoose.model('UniAdmin', Schema);