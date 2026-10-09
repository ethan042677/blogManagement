const jwt = require('jsonwebtoken')
const secretKey = 'gsgrrgrsdfffcdff'

//避免魔法数字，使用常量映射
const PASS = 1;
const FAIL = 0;
//生成token
exports.generateToken = (id) => {
    const payload = {id:id,time:new Date()}
    const token = jwt.sign(payload,secretKey,{expiresIn:60*60*24*30})
    return token;
}
//解码token
exports.verifyToken = (token)=>{
    let payload;
    jwt.verify(token, secretKey,(err,result)=>{
        if(err){
            payload = FAIL;
            console.error("无效的令牌：",err.message)
        }else{
            payload = PASS;
        }
    });
    return payload;

}