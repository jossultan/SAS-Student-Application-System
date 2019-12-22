const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Programme = mongoose.model('Programme');
const University = mongoose.model('University');
const Applicantion = mongoose.model('Application');
const Qualification = mongoose.model('Qualification');
const QualificationObtained = mongoose.model('QualificationObtained');
const Result = mongoose.model('Result');
const Applicant = mongoose.model('Applicant');

var errorMassage = [];
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var subjects = ['General Studies', 'Malay Language', 'Chinese Language', 'Tamil Language', 'Arabic Language'
,'Literature in English', 'History', 'Geography', 'Economics', 'Business', 'Accounting', 'Mathematics',
'Information And Communications Technology', 'Physics', 'Chemistry', 'Biology', 'Law', 'Psychology', 'Biology']


const redirectLogin = (req, res, next) =>{
    if(!req.session.userId){
        res.redirect('/main/login'); 
    }
    else{
        Applicant.findById(req.session.userId, (err, doc)=>{
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
    res.render("applicant/home", {
        viewTitle: "Welcome Applicant"
    });  
});

router.get('/list',redirectLogin ,(req, res) => {
    var listProgramme = [];

    if (req.session.criteria){
        var criteria = {
            programmeName: req.session.criteria,
            closingDate: { $gt: today}}
    }else{
        var criteria = {closingDate: { $gt: today}} ;
    }

    Programme.find(criteria,(err,docs)=>{
        University.find((err, doc)=>{
            for (var x = 0; x < docs.length; x++){
                for (var i = 0; i < doc.length; i++){
                    if (docs[x].universityID == doc[i]._id){
                        listProgramme.push({
                            programmeId: docs[x]._id,
                            programmeName: docs[x].programmeName,
                            universityName: doc[i].universityName,
                            closingDate: docs[x].closingDate
                        });
                    }
                }
            }
            res.render("applicant/listProgramme", {
                viewTitle: "Programme",
                list: listProgramme
            }); 
        });
    });
    req.session.criteria = ''
});

router.post('/list',redirectLogin , (req, res) => { 
    req.session.criteria = req.body.criteria;
    res.redirect('/applicant/list');
});

router.get('/assign/:id',redirectLogin ,(req, res) => { 
    var listProgramme = [];
    Programme.findById(req.params.id,(err,docs)=>{
        University.findById(docs.universityID,(err, doc)=>{
            if (docs.universityID == doc._id){
                listProgramme.push({
                    programmeId: docs._id,
                    programmeName: docs.programmeName,
                    universityName: doc.universityName,
                    closingDate: docs.closingDate,
                    description: docs.description
                });
            }
            res.render("applicant/detailProgramme", {
                viewTitle: "Detail Programme",
                obj: listProgramme[0]
            }); 
        });
    });
});

router.post('/assign',redirectLogin ,(req, res) => {
    QualificationObtained.findOne({userId: req.session.userId},(err, doc)=>{
        if(doc.overallScore == 0){
            res.redirect('/applicant/qualification');
        }
        else{
            var applicantion = new Applicantion();
            applicantion.userId = req.session.userId;
            applicantion.programmeId = req.body.programmeId;
            applicantion.status = "New";
            applicantion.applicationDate = today;
            applicantion.save((err, doc)=>{
                if (!err){
                    res.redirect('/applicant/list');
                }
                else{
                    if(!req.session.userId){
                        res.redirect('/main/login'); 
                    }
                    else{
                        console.log('Error during record insertion : ' + err);
                    }
                }
            });
        }
    });
});

router.get('/qualification',redirectLogin ,(req, res) => {
    QualificationObtained.findOne({userId: req.session.userId},(err,docs)=>{
        if (docs){
            if(docs.overallScore == 0){
                res.redirect('/applicant/result/'+ docs._id);
            }
            else{
                res.render("applicant/qualification", {
                    viewTitle: "Submit Qualification",
                    success: false
                });    
            }
        }
        else{
            Qualification.find((err,doc)=>{
                res.render("applicant/qualification", {
                    viewTitle: "Submit Qualification",
                    list: doc,
                    subjects: subjects
                }); 
            });
        }
    });
});

router.post('/qualification',redirectLogin,(req, res) => { 
    var qualificationObtained = new QualificationObtained();
    qualificationObtained.qulificationId = req.body.qualification;
    qualificationObtained.userId = req.session.userId;
    qualificationObtained.overallScore = 0;
    qualificationObtained.save((err, doc)=>{
        if (!err){
            res.redirect('/applicant/result/'+ doc._id);
        }
        else{
            console.log('Error during record insertion b: ' + err);
        }
    })
});

router.get('/result/:id',redirectLogin , (req, res) => { 
    QualificationObtained.findById(req.params.id,(err,docs)=>{
        Qualification.findById(docs.qulificationId, (err,docQualification)=>{
            Result.find({qualificationObtained: docs._id},(err,doc)=>{
                var myArray = docQualification.resultCalcDescription.split(/([0-9]+)/);
                if (doc.length >= myArray[1]){
                    req.session.result = true;
                }
                else{
                    req.session.result = false;
                }
                var number = myArray[1] - doc.length
                res.render("applicant/result", {
                    viewTitle: "Record Result",
                    subjects: subjects,
                    obj: docs,
                    list: doc,
                    qualification: docQualification,
                    errorMassage: errorMassage[0],
                    success: req.session.result,
                    length: number,
                    number: myArray[1]
                }); 
                errorMassage = [];
            })
        })
    });
    
});

router.post('/result',redirectLogin ,(req, res) => { 
    Qualification.findById(req.body.qualificationId,(err,doc)=>{
        var result = new Result();
        result.subjectName = req.body.subjectName;
        result.grades = req.body.grade;
        result.score = req.body.score;
        result.qualificationObtained = req.body._id;
        if (result.score > doc.maximumScore || result.score < doc.minimumScore){
            errorMassage.push('Not Correct Value')
        }
        if (errorMassage != 0){
            res.redirect('/applicant/result/'+ req.body._id);
        }
        else{
            result.save((err, doc)=>{
                if (!err){
                    res.redirect('/applicant/qualification');
                }
                else{
                    console.log('Error during record insertion : ' + err);
                }
            });
        }
    });
});

router.post('/updateQuaObtain',redirectLogin ,(req, res) => {
    var total = 0;
    Result.find({qualificationObtained: req.body.id},(err,doc)=>{
        for(var i = 0; i < doc.length;i++){
            total += doc[i].score;
        }
        total = total / req.body.number;
        console.log('Error during record insertionb : ' + req.body.number);
        console.log('Error during record insertionc : ' + total);

        QualificationObtained.findOne({_id: doc[0].qualificationObtained},(err,doc)=>{
            console.log('Error during record insertionc : ' + doc.overallScore);
            
            QualificationObtained.update({ _id: req.body.id }, 
                {
                    overallScore : total,
                    qulificationId : doc.qulificationId,
                    userId : doc.userId
                }, (err, doc) => {
                if (!err) { res.redirect('/applicant'); }
                else {
                    console.log('Error during record update : ' + err);
                }
            });
        });
    })
});


module.exports = router;