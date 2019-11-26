const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Qualification = mongoose.model('Qualification');

router.get('/', (req, res) => {
    res.render("sasAdmin/home", {
        viewTitle: "uniAmdin"
    });
});

router.get('/list', (req, res) => {
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

router.get('/addOrEdit', (req, res) => {
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
            default:
                break;
        }
    }
}


router.get('/:id', (req, res) => {
    Qualification.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("sasAdmin/addOrEdit", {
                viewTitle: "Update Qualification",
                qualification: doc
            });
        }
    });
});

router.get('/delete/:id', (req, res) => {
    Qualification.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/sasAdmin/list');
        }
        else { console.log('Error in qualification delete :' + err); }
    });
});

module.exports = router;