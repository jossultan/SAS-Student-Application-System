const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Programme = mongoose.model('Programme');

router.get('/', (req, res) => {
    res.render("uniAdmin/home", {
        viewTitle: "uniAmdin"
    });
});

router.get('/list', (req, res) => {
    Programme.find((err, docs) => {
        if (!err) {
            res.render("uniAdmin/list", {
                list: docs,
                viewTitle: 'List Programme'
            });
        }
        else {
            console.log('Error in retrieving programme list :' + err);
        }
    });
});

router.get('/addOrEdit', (req, res) => {
    Programme.find((err, docs) => {
        if (!err) {
            res.render("uniAdmin/addOrEdit", {
                list: docs,
                viewTitle: 'Record Programme'
            });
        }
        else {
            console.log('Error in retrieving programme list :' + err);
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
    var programme = new Programme();
    programme.programmeName = req.body.programmeName;
    programme.description = req.body.description;
    programme.closingDate = req.body.closingDate;
    programme.save((err, doc) => {
        if (!err){
            res.redirect('uniAdmin/list');
        }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("uniAdmin/addOrEdit", {
                    viewTitle: "Insert Programme",
                    programme: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

function updateRecord(req, res) {
    Programme.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('uniAdmin/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("uniAdmin/addOrEdit", {
                    viewTitle: 'Update Programme',
                    programme: req.body
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
            case 'programmeName':
                console.log('body not define');
                body['programmeNameError'] = err.errors[field].message;
                break;
            case 'closingDate':
                console.log('body not define');
                body['closingDateError'] = err.errors[field].message;
                break;
            case 'description':
                console.log('body not define');
                body['descriptionError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

router.get('/:id', (req, res) => {
    Programme.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("uniAdmin/addOrEdit", {
                viewTitle: "Update Programme",
                programme: doc
            });
        }
    });
});

router.get('/delete/:id', (req, res) => {
    Programme.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/uniAdmin/list');
        }
        else { console.log('Error in programme delete :' + err); }
    });
});

module.exports = router;