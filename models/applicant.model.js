const mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    userName:{
        type: String,
        required: 'This field is required.'
    },
    password:{
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    idType: {
        type: String
    },
    idNumber: {
        type: Number
    },
    mobileNumber:{
        type: Number
    },
    dateOfBirth:{
        type: Date
    }
});

// Custom validation for email
Schema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

mongoose.model('Applicant', Schema);