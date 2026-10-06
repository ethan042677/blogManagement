module.exports = function (app){
    app.get('/', (req, res) => {
        res.send('你好，世界！');
    });
}