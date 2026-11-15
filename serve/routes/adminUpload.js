const express = require('express') 
const {authenticate} = require('../utils/auth')
const media = require('../utils/mediaService')

const router = express.Router()
// 全局登录鉴权
router.use(authenticate)

//生成上传签名
router.post('/presign',async (req,res,next) =>{
    try{
        const data = await media.presignUpload(req.body)
        res.send({
            code:200,
            msg:"签名成功",
            data
        })
    }catch (err) {
        next(err)
    }
})
//确认是否上传成功
router.post('/confirm',async (req,res,next)=>{
    try {
        const data = await media.confirmUpload(req.body.id)
        res.send({
            code:200,
            msg:"确认成功",
            data
        })
    } catch (err) {
        next(err)
    }
})
//
router.get('/:id',async (req,res,next)=>{
    try {
        const data = await media.getUploadStatus(req.params.id)
        res.send({
            code:200,
            msg:"查询状态成功",
            data
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router
