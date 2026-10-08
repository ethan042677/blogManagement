const dbModel = require('../models/db_model')
const jwt = require('../utils/jsonwebtoken')

//查看是否注册
exports.isRegister = async (req,res) =>{
    try {
        //查询数据库是否有注册用户
        const result = await dbModel.isRegister();
        const isRegistered = result[0].count > 0;
        res.send({
            code:200,
            isRegistered:isRegistered,
            msg:isRegistered ? "已注册" : "未注册"
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ code: 500, msg: '数据库查询失败' });
    }

}
//管理员注册
exports.register = async (req,res)=>{
    try {
        const data = req.body;
        //如果注册时提交的姓名或者密码为空
        if(!data.name || !data.password){
            return res.status(400).send({
                code:400,
                msg:"账号密码不能为空"
            })
        }
        //如果前端没有返回时间，就自动生成一个时间
        if(!data.moment){
            data.moment = new Date().toISOString();
        }
        await dbModel.register(data)
        res.send({ 
            code: 200, 
            msg: '注册成功' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ 
            code: 500, 
            msg: '注册失败' 
        });
    }
}
//管理员登录
exports.adminSignin = async (req,res)=>{
    try {
        const data = req.body
        const result = await dbModel.adminSignin(data.name)
        //如果查出的管理员账号存在，且密码相同
        if(result.length > 0 && data.password === result[0].password){
            const token = jwt.generateToken(data.name)
            const adminData = {
                ...result[0],
                ...{token}
            }
            res.send({
                code:200,
                msg:"登录成功",
                data:adminData
            })
        }
    } catch (error) {
        console.error("登录失败")
        res.status(500).send({ 
            code: 500, 
            msg: '登录失败' 
        });
    }
}
