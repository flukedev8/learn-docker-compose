const pool = require('../config/database');
const uuidv1 = require('uuid/v1');



const examinationfee = async(req, res)=>{
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const uuid = uuidv1(''+time);
    const status = "Pending";
    console.log(uuid);
    const{
        titlecheck, refid1, refid2, firstname,lastname,grad,
        round,acy,datepay,timepay,amount,img,chance,bank,
    }= req.body;
    const examinationfee = {
        uuid,titlecheck, refid1, refid2, firstname,lastname,grad,
        round,acy,datepay,timepay,amount,img,chance,bank,status
    };
    await pool.query('INSERT INTO admission_examinationfee set ?',[examinationfee])
    res.status(200).json({
        success: true,
        data: 'done'
    });
};
module.exports = examinationfee;