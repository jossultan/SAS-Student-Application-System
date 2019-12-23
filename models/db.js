const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/SasDB', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});


require('./Programme.model');
require('./qualification.model');
require('./university.model');
require('./university.admin.model');
require('./applicant.model');
require('./application.model');
require('./result.model')
require('./qulificationObtained.model');

