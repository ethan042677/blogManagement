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
        //提交的名称或者密码不合法直接400
        if(!data.name || !data.password){
            return res.status(400).send({
                code:400,
                msg:"账号密码不能为空"
            })
        }
        const result = await dbModel.adminSignin(data.name)
        //账号不存在或者密码错误直接401
        if(result.length === 0 || data.password !== result[0].password){
            return res.status(401).send({
                code:401,
                msg:"账号或者密码错误"
            })
        }
        //登录成功，生成token,
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
    } catch (error) {
        console.error("登录失败")
        res.status(500).send({ 
            code: 500, 
            msg: '登录失败' 
        });
    }
}
//获取评论
exports.getComment = async (req,res)=>{
    try {
        const data = req.body;
        const NO_QUERY = -1 
        let count = NO_QUERY;//未查询
        const result = await dbModel.getCommentPage(data.pageSize,data.nowPage)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getCommentCount()
            count = total[0].count
        }
        //确保数据库里有东西，如果有再把需要的数据整理发送前端
        if(result.length > 0){
            for(let i = 0;i<result.length;i++){
                const articleTitle = await dbModel.getArticleTitle(result[i].article_id)
                result[i].article = {
                    id:result[i].article_id,
                    title:articleTitle[0].title
                }
            }
        } 
        res.send({
            code:200,
            data:{
                count,
                result
            }
        })
    } catch (error) {
        console.error("获取评论失败:", error)
        res.status(500).send({
            code:500,
            msg:"获取评论失败"
        })
    }
}
//获取私信
exports.getMessage = async (req,res)=>{
    try {
        const data = req.body;
        const NO_QUERY = -1 
        let count = NO_QUERY;//未查询
        const result = await dbModel.getMessagePage(data.pageSize,data.nowPage)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getMessageCount()
            count = total[0].count
        }
        //将私信变为已读
        if(result.length > 0){
            for(let i = 0;i < result.length;i++){
                await dbModel.updateMessageRead(result[i].id)
            }
        }
        res.send({
            code:200,
            data:{
                count,
                result
            }
        })
    } catch (error) {
        console.error("获取私信失败:", error)
        res.status(500).send({
            code:500,
            msg:"获取私信失败"
        })
    }
}
//获取文章
exports.getArticle = async (req,res)=>{
    try {
        const data = req.body;
        const NO_QUERY = -1 
        let count = NO_QUERY;//未查询
        const result = await dbModel.getArticlePage(data.pageSize,data.nowPage,data.state,data.categoryId,data.searchTerm)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getArticleCount()
            count = total[0].count
        }
        res.send({
            code:200,
            data:{
                count,
                result
            }
        })
    } catch (error) {
        console.error("获取私信失败:", error)
        res.status(500).send({
            code:500,
            msg:"获取私信失败"
        })
    }
}