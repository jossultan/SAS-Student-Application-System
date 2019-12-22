const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Programme = mongoose.model('Programme');
const Applicantion = mongoose.model('Application');
const QualificationObtained = mongoose.model('QualificationObtained');
const Applicant = mongoose.model('Applicant');
const Qualification = mongoose.model('Qualification');
const Result = mongoose.model('Result');
const UniAdmin = mongoose.model('UniAdmin');
var nodemailer = require('nodemailer');

const redirectLogin = (req, res, next) =>{
    if(!req.session.userId){
        res.redirect('/main/login'); 
    }
    else{
        UniAdmin.findById(req.session.userId, (err, doc)=>{
            if (doc != null){
                if (req.session.userId == doc._id){next();}
                else{redirect(req,res);}
            }
            else{redirect(req,res);}
        })   
    }
}

function redirect(req,res){
    req.session.destroy(err =>{
        if(err){
            return res.redirect('/')
        }
        res.clearCookie('sid');
        res.redirect('/main/login');
    });
}

router.get('/',redirectLogin, (req, res) => {
    res.render("uniAdmin/home", {
        viewTitle: "Welcome",
        university: req.session.universityName,
        universityId: req.session.universityId,
        admin: req.session.userName
    });                  
});


router.get('/list',redirectLogin , (req, res) => {
    console.log('Error in  :' + req.session.universityId);
    Programme.find({universityID: req.session.universityId},(err, docs) => {
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

router.get('/addOrEdit',redirectLogin ,(req, res) => {
    Programme.find({universityID: req.session.universityId}, (err, docs) => {
        if (!err) {
            res.render("uniAdmin/addOrEdit", {
                list: docs,
                viewTitle: 'Record Programme',
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

router.get('/review',redirectLogin ,(req, res) => {
    var listProgramme = [];
    Programme.find({universityID: req.session.universityId},(err, docs) => {
        Applicantion.find((err, doc)=>{
            for (var x = 0; x < docs.length; x++){
                var count = 0;
                for (var i = 0; i < doc.length; i++){
                    if (docs[x]._id == doc[i].programmeId){
                        count++;
                    }
                    if (i == (doc.length - 1)){
                        listProgramme.push({
                            programmeId: docs[x]._id,
                            programmeName: docs[x].programmeName,
                            applicantNumber: count,
                            closingDate: docs[x].closingDate
                        });
                    }
                }
            }
            res.render("uniadmin/listProgramme", {
                viewTitle: 'List Programme',
                list: listProgramme,
            });
        })
            
    })
});

router.get('/listapplicant/:id',redirectLogin , (req, res) => {
    var listProgramme = [];
    Applicantion.find({programmeId: req.params.id},(err, docs)=>{
        if (docs.length == 0){
            res.redirect('/uniadmin/review');
        }
        else{
            for (var x = 0; x < docs.length; x++){
                var status = docs[x].status;
                var id = docs[x]._id;
                var appDate = docs[x].applicationDate;
                Applicant.findById(docs[x].userId, (err, doc)=>{
                    QualificationObtained.findOne({userId: doc._id},(err,docObtain)=>{
                        Qualification.findById(docObtain.qulificationId,(err,docQua)=>{ 
                            listProgramme.push({
                                userId: doc._id,
                                userName: doc.userName,
                                statusb: status,
                                qualificationName: docQua.qualificationName,
                                overallScore: docObtain.overallScore,
                                qualificationObtainId : docObtain._id,
                                applicantionId: id,
                                applicationDate: appDate,
                                userId: doc._id,
                                programmeId: req.params.id,
                                email: doc.email
                            });
                            console.log('Error during record updated : ' + listProgramme.length);
                            res.render("uniadmin/listapplicant", {
                                viewTitle: 'List Applicant',
                                list: listProgramme
                            });
                        });
                    });
                });
            }
        }
    });
});

router.post('/detail', (req, res) => {
    var listProgramme = [];
    listProgramme.push({
        userId: req.body._id,
        userName: req.body.userName,
        statusb: req.body.statusb,
        qualificationName: req.body.qualificationName,
        overallScore: req.body.overallScore,
        applicantionId: req.body.applicantionId,
        applicationDate: req.body.applicationDate,
        userId: req.body.userId,
        programmeId: req.body.programmeId,
        email: req.body.email
    })

    Result.find({qualificationObtained: req.body.qualificationObtainId},(err,docResult)=>{
        res.render("uniadmin/detail", {
            viewTitle: 'Detail Applicant',
            obj: listProgramme[0],
            list: docResult
        });
    }) 
});

router.post('/review', (req, res) => {
    Applicantion.findOne({_id: req.body.applicantionId},(err,doc)=>{
        console.log('Error during record insertionc : ' + doc.status);
        
        Applicantion.update({ _id: req.body.applicantionId }, 
            {
                applicationDate : req.body.applicationDate,
                status : req.body.status,
                userId : req.body.userId,
                programmeId : req.body.programmeId
            }, (err, doc) => {
            if (!err) { 
                res.redirect('/uniadmin'); 
            }
            else {
                console.log('Error during record update : ' + err);
            }
        });
    });
});

function insertRecord(req, res) {
    var programme = new Programme();
    programme.programmeName = req.body.programmeName;
    programme.description = req.body.description;
    programme.closingDate = req.body.closingDate;
    programme.universityID = req.session.universityId;
    programme.save((err, doc) => {
        if (!err){
            res.redirect('uniadmin/list');
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

router.get('/delete/:id',redirectLogin ,(req, res) => {
    Programme.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/uniAdmin/list');
        }
        else { console.log('Error in programme delete :' + err); }
    });
});



module.exports = router;