const serve = require('../controllers/serve.js');

module.exports = function (app){
    app.get('/',(req, res) => {
        res.send('你好，世界！');
    });
    //验证是否注册
    app.post('/isRegister',(req,res) => {
        serve.isRegister(req,res)
    }) 
    //管理员注册
    app.post('/register',(req,res) => {
        serve.register(req,res)
    }) 
    //管理员登录
    app.post('/signin',(req,res) => {
        serve.adminSignin(req,res)
    }) 
}