const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const uuidv1 = require('uuid/v1');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');


const storage = multer.diskStorage({
    destination:function(req, file,cb){
        cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname);
    }
});

const filefilter = (req,file,cb)=>{
    //reject a file
    if(file.mimetype === 'image/jpeg'|| file.mimetype ==='image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits:{
    fileSize:1024 * 1024 *5 
    },
    fileFilter: filefilter
});


router.post('/activity',upload.single('bookbank'),checkAuth, async(req,res)=>{
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const uuidrefund_activity = uuidv1(''+time);
    const  status = 'Pending';
    const img = req.file.path;
    const img2 = img.split("\\")[1]
    const getdatarefund ={
         uuidrefund_activity,
         uuid_activity_payment : req.body.uuidpayment,
         text: req.body.text,
         payitem:req.body.payitem,
         studentid : req.body.studentid,
         studentname: req.body.studentname,
         parent_name: req.body.parentname,
         grade: req.body.grade,
         acy:req.body.acy,
         amount: req.body.amount,
         status,
         bookbank:img2

    };
    await pool.query('INSERT INTO refund_activity set ?',[getdatarefund])
    .then(result=>{
        // console.log(result)
        if(result){
            return res.status(200).json({
                success: true,
                massage:'Sucessfuly',
            });
        }
    })
    .catch(error=>{
        if(error){
            res.status(404).json({
                massage:error
            });
        }
    });

});

router.post('/status',checkAuth,async(req,res)=>{
    const studentid = req.body.studentid;
    await pool.query('SELECT * FROM refund_activity WHERE studentid = ?',[studentid])
    .then(result=>{
        // console.log(result)
        if(result.length < 1){
            return res.status(201).json({
                success: false,
                massage:'not have a data'
            });
        }else{
            return res.status(200).json({
                success: true,
                massage:'Sucessfuly',
                data: result
            });
        }
    })
    .catch(error=>{
        if(error){
            res.status(404).json({
                massage:error
            });
        }
    });
});


router.get('/dashbord/refund',checkAuth,async(req,res)=>{
    const status = 'Pending';
    await pool.query('SELECT * FROM refund_activity WHERE status = ?',[status])
    .then(result=>{
        // console.log(result)
        if(result.length < 1){
            return res.status(201).json({
                success: false,
                massage:'not have a Pending'
            });
        }else{
            return res.status(200).json({
                success: true,
                massage:'Sucessfuly',
                data: result
            });
        }
    })
    .catch(error=>{
        if(error){
            res.status(404).json({
                massage:error
            });
        }
    });
});

router.post('/dashbord/refund',checkAuth,async(req,res)=>{
    const getstudentid = req.body.studentid;
    const payitem = req.body.payitem
    const status = 'Approved';
    await pool.query('UPDATE refund_activity set status = ? WHERE studentid = ? AND payitem = ? ',[status, getstudentid, payitem])
    .then(result=>{
        return res.status(200).json({
            success: true,
            massage:'Sucessfuly',
            data: result
        });
    })
    .catch(error=>{
        if(error){
            res.status(404).json({
                massage:error
            });
        }
    });
});

router.post('/dashbord/refund/approved',checkAuth, async(req,res)=>{
    const payitem = req.body.payitem;
    const grade =  req.body.grade;
    const acy = req.body.acy;
    const status = 'Approved';
    await pool.query('SELECT * FROM refund_activity WHERE payitem = ? AND grade = ? AND  acy = ? AND status = ? ', [payitem,grade,acy,status])
    .then(result=>{
        return res.status(200).json({
            success: true,
            massage:'Sucessfuly',
            data: result
        });
    })
    .catch(error=>{
        if(error){
            res.status(404).json({
                massage:error
            });
        }
    });
});



module.exports = router;