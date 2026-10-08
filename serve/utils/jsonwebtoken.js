const jwt = require('jsonwebtoken')
const secretKey = 'gsgrrgrsdfffcdff'
//生成token
exports.generateToken = (id) => {
    const payload = {id:id,time:new Date()}
    const token = jwt.sign(payload,secretKey,{expiresIn:60*60*24*30})
    return token;
}
//解码token
exports.verifyToken = (id)=>{
    try {
        let payload;
        jwt.verify(id, secretKey,(err,result)=>{
            if(err){
                payload = 0;
            }else{
                payload = 1;
            }
        });
        return payload;
    } catch (error) {
        console.error("无效的令牌")
    }

}