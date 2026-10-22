const dbModel = require('../models/db_model')
const jwt = require('../utils/jsonwebtoken')
const handleFile = require('../utils/handleFile')
//常量映射
const NO_QUERY = -1 
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
        let count = NO_QUERY;//未查询
        const result = await dbModel.getCommentPage(data.pageSize,data.nowPage)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getCommentCount(-1)
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
        let count = NO_QUERY;//未查询
        const result = await dbModel.getArticlePage(data.pageSize,data.nowPage,data.state,data.categoryId,data.searchTerm,data.classify)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getArticleCount()
            count = total[0].count
        }
        //确保数据库里有东西，如果有再把需要的数据整理发送前端
        if(result.length > 0){
            for(let i = 0;i<result.length;i++){
                const praise = dbModel.getPraiseCount(result[i].id,-1)//点赞数
                const comment = dbModel.getCommentCount(result[i].id)//评论条数
                result[i].praise = praise[0].count
                result[i].comment = comment[0].count
                //分割标签
                if(result[i].label){
                    result[i].label = result[i].label.split(",")
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
        console.error("获取私信失败:", error)
        res.status(500).send({
            code:500,
            msg:"获取私信失败"
        })
    }
}
//修改文章状态
exports.changeArticleState = async (req,res) => {
    try {
        const data = req.body
        const result = await dbModel.changeArticleState(data.id,data.state)
        res.send({
            code:200,
            msg:"文章状态修改成功"
        })
    } catch (error) {
        console.error("文章状态修改失败：",error)
        res.status(500).send({
            code:500,
            msg:"修改文章状态失败"
        })
    }
}
//删除文章
exports.deleteArticle = async (req,res) =>{
    try {
        const data = req.body
        const result  = await dbModel.deleteArticle(data.id)
        res.send({
            code:200,
            msg:"文章删除成功"
        })
    } catch (error) {
        console.error("文章删除失败",error)
        res.status(500).send({
            code:500,
            msg:"删除文章失败"
        })
    }
}
//查询文章不同状态总数
exports.getArticleStateCount = async (req,res)=>{
    try {
        const data = req.body
        //未发布总数
        const unpublishState = await dbModel.getArticleCount(0,-1,'',0)
        //已发布总数
        const publishState = await dbModel.getArticleCount(1,-1,'',0)
        const result = [
            {
                id:0,//未发布
                value:unpublishState[0].count
            },{
                id:1,//已发布
                value:publishState[0].count
            }
        ]
        res.send({
            code:200,
            data:result
        })
    } catch (error) {
        console.error("文章不同状态数量查询失败",error)
        res.status(500).send({
            code:500,
            msg:"文章不同状态数量查询失败"
        })
    }
}

//获取分类
exports.getCategory = async (req,res) =>{
    try {
        const data = req.body
        const result = await dbModel.getCategory(data.classify)
        //如果是文章或者图片
        if(data.classify === 0 || data.classify === 1){
            //总条数
            const count = await dbModel.getArticleCount(-1,-1,"",data.classify)
            //返回的数据
            const list  = []
            if(result.length > 0){
                for(let i = 0;i<result.length;i++){
                    // 每个标签下的条数
                    const value = await dbModel.getArticleCount(-1,result[i].id,"",data.classify) 
                    list[i] = {
                        id:result[i].id,
                        name:result[i].category_name,
                        value:value[0].count
                    }
                }
            }
            res.send({
                code:200,
                data:{
                    count:count[0].count,
                    list
                }
            })
        }else if(data.classify === 2){
            //查文件
            //总条数
            const count = await dbModel.getFileCount(-1)
            //返回的数据
            const list  = []
            if(result.length > 0){
                for(let i = 0;i < result.length;i++){
                    // 每个标签下的条数
                    const value = await dbModel.getFileCount(result[i].id) 
                    list[i] = {
                        id:result[i].id,
                        name:result[i].category_name,
                        value:value[0].count
                    }
                }
            }
            res.send({
                code:200,
                data:{
                    count:count[0].count,
                    list
                }
            })
        }
    } catch (error) {
        console.error("获取分类失败",error)
        res.status(500).send({
            code:500,
            msg:"获取分类失败"
        })
    }
}
//新建分类
exports.addCategory = async (req,res) =>{
    try {
        const data = req.body
        await dbModel.addCategory(data.value)
        res.send({
            code:200
        })
    } catch (error) {
        console.error("新建分类失败",error)
        res.status(500).send({
            code:500,
            msg:"新建分类失败"
        })
    }
}
//修改分类名称
exports.updateCategoryName = async (req,res) => {
    try {
        const data = req.body
        const result = await dbModel.updateCategoryName(data.categoryId,data.categoryName)
        res.send({
            code:200,
            msg:"修改分类名称成功"
        })
    } catch (error) {
        console.error("修改分类名称失败",error)
        res.status(500).send({
            code:500,
            msg:"修改分类名称失败"
        })
    }
}
//删除分类
exports.deleteCategory = async (req,res) =>{
    try {
        const data = req.body
        const result  = await dbModel.deleteCategory(data.categoryId)
        res.send({
            code:200,
            msg:"分类删除成功"
        })
    } catch (error) {
        console.error("分类删除失败",error)
        res.status(500).send({
            code:500,
            msg:"删除分类失败"
        })
    }
}

//获取标签
exports.getLabel = async (req,res)=>{
    try {
        const result  = await dbModel.getLabel()
        res.send({
            code:200,
            data:result
        })
    } catch (error) {
        console.error("获取标签失败",error)
        res.status(500).send({
            code:500,
            msg:"获取标签失败"
        })
    }
}
//新建标签
exports.addLabel = async (req,res) =>{
    try {
        const data = req.body
        await dbModel.addCategory(data.value)
        res.send({
            code:200
        })
    } catch (error) {
        console.error("新建标签失败",error)
        res.status(500).send({
            code:500,
            msg:"新建标签失败"
        })
    }
}
//删除标签
exports.deleteLabel = async (req,res) =>{
    try {
        const data = req.body
        const result  = await dbModel.deleteLabel(data.labelId)
        res.send({
            code:200,
            msg:"标签删除成功"
        })
    } catch (error) {
        console.error("标签删除失败",error)
        res.status(500).send({
            code:500,
            msg:"删除标签失败"
        })
    }
}

//获取文件
exports.getFilePage = async (req,res) =>{
    try {
        const data = req.body
        let count = NO_QUERY
        const result = await dbModel.getFilePage(data.pageSize,data.nowPage,data.categoryId)
        //需要count，再去查count
        if(data.count){
            const total = await dbModel.getFileCount(data.categoryId)
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
        console.error("获取文件失败",error)
        res.status(500).send({
            code:500,
            msg:"获取文件失败"
        })
    }
}

//移动文件
exports.moveFile = async (req,res) => {
    try {
        const data = req.body
        const result = await dbModel.moveFile(data.fileId,data.categoryId)
        res.send({
            code:200,
            msg:"移动文件成功"
        })
    } catch (error) {
        console.error("移动文件失败",error)
        res.status(500).send({
            code:500,
            msg:"移动文件失败"
        })
    }
}

//获取日记
exports.getDiaryPage = async (req,res) => {
    try {
        const data = req.body
        let count = NO_QUERY
        const result = await dbModel.getDiaryPage(data.pageSize,data.nowPage,data.searchTerm)
        //如果需要条数
        if(data.count){
            const total = await dbModel.getDiaryCount(data.searchTerm)
            count = total[0].count
        }
        //确保数据库里有东西，如果有再把需要的数据整理发送前端
        if(result.length > 0){
            for(let i = 0;i<result.length;i++){
                //如果有picture
                if(result[i].picture){
                    result[i].picture = result[i].picture.split(",")
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
        console.error("获取日记失败",error)
        res.status(500).send({
            code:500,
            msg:"获取日记失败"
        })
    }
}
//删除日记
exports.deleteDiary = async (req,res) =>{
    try {
        const data = req.body
        const result  = await dbModel.deleteDiary(data.diaryId)
        res.send({
            code:200,
            msg:"日记删除成功"
        })
    } catch (error) {
        console.error("日记删除失败",error)
        res.status(500).send({
            code:500,
            msg:"删除日记失败"
        })
    }
}

//新建文章/图库
exports.createArticle = async (req,res) =>{
    try {
        const data = req.body
        const result = dbModel.createArticle(data.value)
        res.send({
            code:200,
            msg:"新建文章/图库成功"
        })
    } catch (error) {
        console.error("新建文章/图库失败",error)
        res.status(500).send({
            code:500,
            msg:"新建文章/图库失败"
        })
    }
}
//获取文章/图库（用于修改）
exports.gainArticle = async (req,res) =>{
    try {
        const data = req.body
        const result = await dbModel.gainArticle(data.id)
        res.send({
            code:200,
            data:result,
            msg:"获取文章/图库成功"
        })
    } catch (error) {
        console.error("获取文章/图库失败",error)
        res.status(500).send({
            code:500,
            msg:"获取文章/图库失败"
        })
    }
}
//修改文章/图库
exports.updateArticle = async (req,res) =>{
    try {
        const data = req.body
        const result = await dbModel.updateArticle(data.id,data.value)
        res.send({
            code:200,
            msg:"修改文章/图库成功"
        })
    } catch (error) {
        console.error("修改文章/图库失败",error)
        res.status(500).send({
            code:500,
            msg:"修改文章/图库失败"
        })
    }
}

//新建日记
exports.createDiary = async (req,res) =>{
    try {
        const data = req.body
        const result = dbModel.createDiary(data.value)
        res.send({
            code:200,
            msg:"新建日记成功"
        })
    } catch (error) {
        console.error("新建日记失败",error)
        res.status(500).send({
            code:500,
            msg:"新建日记失败"
        })
    }
}

//上传文件
exports.uploadFile = async (data,res) =>{
    try {
        const result = dbModel.uploadFile(data)
        //传回给前端的数据
        const value = {
            ...data,
            ...{id:result.insertId}//id
        }
        res.send({
            code:200,
            data:value,
            msg:"上传文件成功"
        })
    } catch (error) {
        console.error("上传文件失败",error)
        res.status(500).send({
            code:500,
            msg:"上传文件失败"
        })
    }
}
//删除文件
exports.deleteFile = async (req,res)=>{
    try {
        const data = req.body
        const result = await dbModel.deleteFile(data.fileId)
        //处理真实的文件删除
        handleFile.deleteFiles(data.filesUrl)
        res.send({
            code:200,
            msg:"文件删除成功"
        })
    } catch (error) {
        console.error("删除文件失败",error)
        res.status(500).send({
            code:500,
            msg:"删除文件失败"
        })
    }
}

//获取总览数据
exports.getOverview = async (req,res)=>{
    try {
        const article = await dbModel.getArticleCount(-1,-1,"",0)
        const gallery = await dbModel.getArticleCount(-1,-1,"",1)
        const diary = await dbModel.getDiaryCount("")
        const files = handleFile.calculateFileSize("public/files")
        const fileFormatSize = handleFile.formatSize(files)
        const data = {
            article:article[0].count,
            gallery:gallery[0].count,
            diary:diary[0].count,
            file:fileFormatSize
        }
        res.send({
            code:200,
            data
        })
    } catch (error) {
        console.error("获取总览数据失败",error)
        res.status(500).send({
            code:500,
            msg:"获取总览数据失败"
        })
    }
}