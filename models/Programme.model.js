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
        type: String,
        required: 'Date must be set.'
    }
})

mongoose.model('Programme', schema);