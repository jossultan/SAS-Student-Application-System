require('./models/db');

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');

const sasAdminController = require('./controllers/sasAdminController');
const uniAdminController = require('./controllers/uniAdminController');
const mainController = require('./controllers/mainController');
const applicantController = require('./controllers/applicantController');

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
    PORT = 3000,
    SESS_LIFETIME = TWO_HOURS,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret_value'
} = process.env

const IN_PROD = NODE_ENV === 'production'

var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(expressValidator());
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}));

app.use(bodyparser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.listen(PORT, () => {
    console.log('Express server started at port : '+ PORT);
});

app.post('/logout', (req, res) => {
    req.session.destroy(err =>{
        if(err){
            return res.redirect('/')
        }
        res.clearCookie(SESS_NAME);
        res.redirect('/main/login');
    });
});

app.get('/', (req, res) => {
    res.render("main/home", {
        viewTitle: 'Welcome'
    });
});

app.use('/sasadmin', sasAdminController);
app.use('/uniadmin', uniAdminController);
app.use('/main', mainController);
app.use('/applicant', applicantController);