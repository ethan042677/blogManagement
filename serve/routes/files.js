const multer = require('multer');
const serve = require('../controllers/serve.js');

// 配置存储：指定目录和文件名（避免重名覆盖）
const storage = multer.diskStorage({
    //储存地址
    destination: (req, file, cb) => {
        cb(null, './public/files'); // 确保该目录存在
    },
    //储存名称
    filename: (req, file, cb) => {
        //正则表达式匹配后缀名,防止上传中文
        const regFileExtension = file.originalname.replace(/.+\./,".")
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + regFileExtension;
        cb(null,name);
    }
});

const upload = multer({ storage: storage });

// 路由：upload.single('avatar') 中的 'avatar' 必须与前端表单的 name 属性一致
module.exports = function (app) {
    app.post('/profile', upload.single('avatar'), (req, res) => {
        // req.file 包含上传文件的信息（如 path, filename, size）
        // req.body 包含文本字段
        try {
            //切割文件名称,格式
            const file = file.originalname.split(".")
            const data = {
                url:req.file.filename,
                name:file[0],
                format:file[1],
                moment:Date(),
            }
            //上传文件
            serve.uploadFile(data,res)
        } catch (error) {
            res.status(400).send({
                code:400,
                msg:"上传成功"
            })
        }
    });
}
