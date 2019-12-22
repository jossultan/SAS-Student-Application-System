const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Applicant = mongoose.model('Applicant');
const UniAdmin = mongoose.model('UniAdmin');
const University = mongoose.model('University');

const redirectHome = (req, res, next) =>{
    if(!req.session.userId){
        next();
    }
    else{
        UniAdmin.findById(req.session.userId, (err, docs)=>{
            if(!docs){
                console.log('Error: ' + err);
            }
            else{
                Applicant.findById(req.session.userId, (err, doc)=>{
                    if (req.session.userId == docs._id){
                        res.redirect('/uniadmin');
                    }
                    else if (req.session.userId == doc._id){
                        res.redirect('/applicant');
                    }
                    else if (req.session.userId == '5df835e4abf1e03fe83a1b37'){
                        res.redirect('/sasadmin');
                    }
                    else{
                        next();
                    }
                })
            } 
        })
    }
}

router.get('/', redirectHome , (req, res) => {
    res.render("main/home", {
        viewTitle: 'Welcome'
    });
});

router.get('/register', redirectHome ,(req, res) => {
    res.render("main/register", {
        viewTitle: "Register"
    });
});

router.post('/register',(req, res) => {
    var applicant = new Applicant();
    applicant.userName = req.body.userName;
    applicant.password = req.body.password;
    applicant.name = req.body.name;
    applicant.email = req.body.email;
    applicant.idType = req.body.idType;
    applicant.idNumber = req.body.idNumber;
    applicant.mobileNumber = req.body.mobileNumber;
    applicant.dateOfBirth = req.body.dateOfBirth;
    applicant.save((err,doc)=>{
        if (!err){
            req.session.userId = doc._id;
            req.session.userName = doc.userName;
            res.redirect('/sasAdmin/uniAdminList/');
        }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("main/register", {
                    viewTitle: "Register",
                    obj: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
});

router.get('/login',redirectHome ,(req, res) => {
    res.render("main/login", {
        viewTitle: "Login",
        success: req.session.success,
        errors: req.session.errors,
        obj: req.body
    });
    req.session.errors = null;
});

router.post('/login', (req, res) => {
    req.check('email', 'Invalid Email Address').isEmail();
    req.check('password', "Password is Invalid").isLength({min: 4});

    var errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        req.session.success = false;    
    }
    else{
        req.session.success = true;
    }
    
    var criteria = {email: req.body.email, password: req.body.password};

    if (req.body.email == 'admin@g.com' && req.body.password == 'admin'){
        req.session.userId = '5df835e4abf1e03fe83a1b37';
        req.session.userName = "Admin";
        res.redirect('/sasadmin');
    }
    else{
        Applicant.find(criteria,(err,docUser)=>{
            if (!err){
                if(docUser.length != 0){
                    req.session.userId = docUser[0]._id;
                    req.session.userName = docUser[0].userName;
                    res.redirect('/applicant');
                    console.log("applicant")
                }
                else{
                    console.log("not applicant");
                    UniAdmin.find(criteria,(err,docAdmin)=>{
                        if(docAdmin.length == 0){
                            console.log("not University");
                            res.redirect('/main/login')
                        }
                        else{
                            University.findById(docAdmin[0].universityID, (err, docs)=>{
                                console.log("halo: "+ docs.universityName);
                                req.session.userId = docAdmin[0]._id;
                                req.session.userName = docAdmin[0].userName;
                                req.session.universityId = docs._id;
                                req.session.universityName = docs.universityName;
                                res.redirect('/uniAdmin');
                                if (err)
                                    console.log("not University" + err);
                            })
                        }
                    }) 
                }
            }
        });
    }
});

function handleValidationError(err, body) {
    for (field in err.errors) {
        console.log(err);
        switch (err.errors[field].path) {
            case 'userName':
                body['userNameError'] = err.errors[field].message;
                break;
            case 'password':
                body['passwordError'] = err.errors[field].message;
                break;
            case 'name':
                body['nameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            case 'idType':
                body['idTypeError'] = err.errors[field].message;
                break;
            case 'idNumber':
                body['idNumberError'] = err.errors[field].message;
                break;
            case 'mobileNumber':
                body['mobileNumberError'] = err.errors[field].message;
                break;
            case 'dateOfBirth':
                body['dateOfBirthError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;