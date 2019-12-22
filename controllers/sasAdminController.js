const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Qualification = mongoose.model('Qualification');
const University = mongoose.model('University');
const UniAdmin = mongoose.model('UniAdmin');

const redirectLogin = (req, res, next) =>{
    if(!req.session.userId){
        res.redirect('/main/login'); 
    }
    else{
        if (req.session.userId == '5df835e4abf1e03fe83a1b37'){
            next();
        }
        else{
            req.session.destroy(err =>{
                if(err){
                    return res.redirect('/')
                }
                res.clearCookie('sid');
                res.redirect('/main/login');
            });
        }
    }
}


router.get('/',redirectLogin ,(req, res) => {
    res.render("sasAdmin/home", {
        viewTitle: "uniAmdin"
    });
});

router.post('/addUniversity', (req, res) => {
    var university = new University();
    university.universityName = req.body.universityName;
    university.save((err, doc) => {
        if (!err)
            res.redirect('/sasAdmin/uniList');
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("sasAdmin/addUniversity", {
                    viewTitle: "New University",
                    university: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
});

router.post('/addUniAdmin/:id', (req, res) => {
    var uniAdmin = new UniAdmin();
    uniAdmin.userName = req.body.userName;
    uniAdmin.password = req.body.password;
    uniAdmin.name = req.body.name;
    uniAdmin.email = req.body.email;
    uniAdmin.universityID = req.params.id;
    uniAdmin.save((err, doc) => {
        if (!err)
            res.redirect('/sasAdmin/uniAdminList/'+req.params.id);
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("sasAdmin/addUniAdmin", {
                    viewTitle: "New University Admin",
                    admin: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
});

router.get('/addUniversity',redirectLogin ,(req, res) => {
    res.render("sasAdmin/addUniversity", {
        viewTitle: "New University"
    });
});

router.get('/uniList',redirectLogin ,(req, res) => {
    University.find((err,docs) =>{
        if (!err) {
            res.render("sasAdmin/uniList", {
                list: docs,
                viewTitle: 'List University'
            });
        }
        else {
            console.log('Error in retrieving qualification list :' + err);
        }
    });
});

router.get('/list',redirectLogin ,(req, res) => {
    Qualification.find((err, docs) => {
        if (!err) {
            res.render("sasAdmin/list", {
                list: docs,
                viewTitle: 'Record Qualification'
            });
        }
        else {
            console.log('Error in retrieving qualification list :' + err);
        }
    });
});

router.get('/addOrEdit',redirectLogin ,(req, res) => {
    Qualification.find((err, docs) => {
        if (!err) {
            res.render("sasAdmin/addOrEdit", {
                list: docs,
                viewTitle: 'Record Qualification'
            });
        }
        else {
            console.log('Error in retrieving qualification list :' + err);
        }
    });
});

router.get('/addUniAdmin', redirectLogin,(req, res) => {
    UniAdmin.find((err, docs) => {
        if (!err) {
            res.render("sasAdmin/addUniAdmin", {
                list: docs,
                viewTitle: 'Record Admin'
            });
        }
        else {
            console.log('Error in retrieving qualification list :' + err);
        }
    });
});

router.post('/', (req, res) => {
    if (req.body._id == '')
        insertRecord(req, res);
    else
        updateRecord(req, res);
});


function insertRecord(req, res) {
    var qualification = new Qualification();
    qualification.qualificationName = req.body.qualificationName;
    qualification.minimumScore = req.body.minimumScore;
    qualification.maximumScore = req.body.maximumScore;
    qualification.resultCalcDescription = req.body.resultCalcDescription;
    qualification.gradeList = req.body.gradeList;
    qualification.save((err, doc) => {
        if (!err)
            res.redirect('sasAdmin/list');
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("sasAdmin/addOrEdit", {
                    viewTitle: "Insert Qualification",
                    qualification: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

function updateRecord(req, res) {
    Qualification.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('sasAdmin/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("sasAdmin/addOrEdit", {
                    viewTitle: 'Update Qualification',
                    qualification: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'qualificationName':
                body['qualificationNameError'] = err.errors[field].message;
                break;
            case 'minimumScore':
                body['minimumScoreError'] = err.errors[field].message;
                break;
            case 'maximumScore':
                body['maximumScoreError'] = err.errors[field].message;
                break;
            case 'resultCalcDescription':
                body['resultCalcDescriptionError'] = err.errors[field].message;
                break;
            case 'gradeList':
                body['gradeListError'] = err.errors[field].message;
                break;
            case 'universityName':
                body['universityNameError'] = err.errors[field].message;
                break;
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
            default:
                break;
        }
    }
}

router.get('/addUniAdmin/:id', redirectLogin,(req, res) => {
    University.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("sasAdmin/addUniAdmin", {
                viewTitle: "Add Univeristy Admin",
                admin: doc,
                ID: req.params.id
            });
        }
    });
});

router.get('/uniAdminList/:id', redirectLogin,(req, res) => {
    UniAdmin.find
    UniAdmin.find({ universityID: req.params.id }, (err, doc) => {
        if (!err) {
            res.render("sasAdmin/uniAdminList", {
                viewTitle: "List Admin",
                list: doc,
                ID: req.params.id
            });
        }
    });
});


router.get('/addUniAdmin/delete/:id', redirectLogin,(req, res) => {
    UniAdmin.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/sasAdmin/uniAdminList');
        }
        else { console.log('Error in qualification delete :' + err); }
    });
});


router.get('/:id',redirectLogin ,(req, res) => {
    Qualification.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("sasAdmin/addOrEdit", {
                viewTitle: "Update Qualification",
                qualification: doc
            });
        }
    });
});

router.get('/delete/:id',redirectLogin ,(req, res) => {
    Qualification.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/sasAdmin/list');
        }
        else { console.log('Error in qualification delete :' + err); }
    });
});

module.exports = router;