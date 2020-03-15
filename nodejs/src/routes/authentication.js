const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const uuidv1 = require('uuid/v1');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = process.env.JWT_KEY ||'database' ;
const config = require('../config/keys')[env];
const checkAuth = require('../middleware/check-auth');


router.get('/',(req, res) =>{
    res.send('hello auth0');
});

router.post('/adduser',checkAuth, async(req, res ,next)=>{
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const uuid = uuidv1(''+time);
    bcrypt.hash(req.body.password ,10, async(err, hash)=>{
        if(err){
            return res.status(500).json({
                error: err
            });
        }else{
            const getdata = {
                uuid,
                username: req.body.username,
                email: req.body.email,
                password: hash,
                role:req.body.role,
            };
             await pool.query('INSERT INTO user_kmids set ?',[getdata])
             .then( result =>{
                 console.log(result);
                 res.status(200).json({
                     message: 'User created'
                 })
             })
             .catch(err=>{
                 console.log(err);
                 res.status(500).json({
                    error:err
                 });
             });
        }
    });

});


router.post('/loginstaff',async(req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    var alldata = null;
     await pool.query('SELECT * FROM user_kmids WHERE email = ?',[email])
     .then(result=>{
         if(result.length < 1 ){
            return res.status(404).json({
                message:'not found email',
            });
         }else{
                const temp = result;
            return alldata = temp;
            }
     })
     .catch(error=>{
        if(error){
            res.send({
                code: 400,
                failed: "Error ocurred",
                data:error
            });
        }
     });
    //  console.log(alldata);
     await bcrypt.compare(password, alldata[0].password, async (err, result)=>{
         if(result){
            const token = jwt.sign({
                 uuid: alldata[0].uuid,
                 email: alldata[0].email,
                 role: alldata[0].role
             },
             config.JWT_KEY,{
                 expiresIn: "1h"
             }
             );
             const data = {
                uuid: alldata[0].uuid,
                email: alldata[0].email,
                username: alldata[0].username,
                role: alldata[0].role
             };
            return res.status(200).json({
                success: true,
                data: data,
                token: token,
                message :"ล็อคอินเรียบร้อยแล้ว"
            });
         }else{
            return res.status(401).json({
                message:'password not math',
            });
         }
     } );
   
});

router.post('/loginparent',async(req,res, next)=>{
    const studentid = req.body.studentid;
    const parentid = req.body.parentid;
    var alldata = null;
    await pool.query('SELECT * FROM student_kmids WHERE student_id = ?',[studentid])
    .then(result=>{
        if(result.length < 1 ){
            const temp = "not have student ID";
            return alldata = temp;
         }else{
                const temp = result;
            return alldata = temp;
            }
    })
    .catch(error=>{
        if(error){
            res.send({
                code: 400,
                failed: "Error ocurred",
                data:error
            });
        }
    });
    console.log(alldata[0].mothers_first_name);
    if(alldata ==='not have student ID'){
        return res.status(201).json({
            success: false,
            message :"not have student ID"
        });
    }
    if(parentid === alldata[0].fathers_id){
        const token = jwt.sign({
            studentid: alldata[0].student_id,
            grade: alldata[0].grade,
        },
        config.JWT_KEY,{
            expiresIn: "1h"
        }
        );
        const data = {
           studentid: alldata[0].student_id,
           studant_name: alldata[0].first_name+" "+alldata[0].last_name,
           grade: alldata[0].grade,
           parent_name: alldata[0].fathers_frist_name+" "+alldata[0].fathers_last_name
        };
       return res.status(200).json({
           success: true,
           data: data,
           token: token,
           message :"ล็อคอินเรียบร้อยแล้ว"
       });
    }
    if(parentid === alldata[0].mothers_id){
        const token = jwt.sign({
            studentid: alldata[0].student_id,
            grade: alldata[0].grade,
        },
        config.JWT_KEY,{
            expiresIn: "1h"
        }
        );
        const data = {
           studentid: alldata[0].student_id,
           studant_name: alldata[0].first_name+" "+alldata[0].last_name,
           grade: alldata[0].grade,
           parent_name: alldata[0].mothers_first_name+" "+alldata[0].mothers_last_name
        };
       return res.status(200).json({
           success: true,
           data: data,
           token: token,
           message :"ล็อคอินเรียบร้อยแล้ว"
       });
    }
    if(parentid !== alldata[0].mothers_id && parentid !== alldata[0].fathers_id){
        return res.status(201).json({
            success: false,
            message :"รหัสประชาชนท่านผิดพลาด"
        });
    }
});


module.exports = router;