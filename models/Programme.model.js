const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    programmeName:{
        type: String,
        required: 'This field is required.'
    },
    description:{
        type: String,
        required: 'This field is required.'
    },
    closingDate:{
        type: Date,
        required: 'Date must be set.'
    },
    universityID:{
        type: String
    }
})

mongoose.model('Programme', schema);