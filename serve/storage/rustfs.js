const {
    S3Client,
    PutObjectCommand,
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const config = require('../config/default')

function createClient(endpoint) {
    return new S3Client({
        endpoint,//RustFS地址
        region: config.rustfs.REGION,//S3兼容
        forcePathStyle: config.rustfs.FORCE_PATH_STYLE,//强制使用路径风格
        credentials: {
            accessKeyId: config.rustfs.ACCESS_KEY,
            secretAccessKey: config.rustfs.SECRET_KEY,
        },
    })
}
//本机RustFS客户端
const internalClient = createClient(config.rustfs.INTERNAL_ENDPOINT)
//服务器端
const publicClient = createClient(config.rustfs.PUBLIC_ENDPOINT)

//规定浏览器执行什么样的请求
const createPresignedPut = ({ key, mimeType, size }) => {
    const command = new PutObjectCommand({
        Bucket: config.rustfs.BUCKET,//只能写入指定桶
        Key: key,
        ContentType: mimeType,//mimeType必须匹配
        ContentLength: size,//必须声明大小
    })
//生成一个五分钟有效的URL
    return getSignedUrl(publicClient, command, {
        expiresIn: 300,
    })
}
//S3查对象的元信息，
const headObject = (key) => {
    return internalClient.send(
        new HeadObjectCommand({
            Bucket: config.rustfs.BUCKET,
            Key: key,
        }),
    )
}
//下载对象（读取）
const getObject = (key) => {
    return internalClient.send(
        new GetObjectCommand({
            Bucket: config.rustfs.BUCKET,
            Key: key,
        }),
    )
}
//服务端回补，写回RustFS
const putBuffer = ({ key, body, contentType }) => {
    return internalClient.send(
        new PutObjectCommand({
            Bucket: config.rustfs.BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
        }),
    )
}
//删除指定KEY的对象
const deleteObject = (key) => {
    return internalClient.send(
        new DeleteObjectCommand({
            Bucket: config.rustfs.BUCKET,
            Key: key,
        }),
    )
}
//数据库只存object key 拼接后返回前端
const publicUrl = (key) => {
    const encodedKey = key.split('/').map(el=> encodeURIComponent(el)).join('/')

    return [
        config.rustfs.PUBLIC_ENDPOINT,
        config.rustfs.BUCKET,
        encodedKey,
    ].join('/')
}

module.exports = {
    internalClient,
    publicClient,
    createPresignedPut,
    headObject,
    getObject,
    putBuffer,
    deleteObject,
    publicUrl,
}