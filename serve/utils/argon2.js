const argon2 = require('argon2')

class Argon2 {
    //对密码进行argon2算法加密
    async hashPassword (password) {
        return await argon2.hash(password,{
            type: argon2.argon2id, // 显式指定 Argon2id
            memoryCost: 65536,     // 64 MiB
            timeCost: 3,//迭代次数
            parallelism: 4,//并行次数
        });
    }
    //校验密码
    async comparePasswords(hashPassword,enteredPassword) {
        return await argon2.verify(hashPassword,enteredPassword)
    }
}
module.exports = new Argon2()