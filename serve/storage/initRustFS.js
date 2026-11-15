const {
    HeadBucketCommand,
    CreateBucketCommand,
    PutBucketCorsCommand,
    PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3')

const config = require('../config/default')
const { internalClient } = require('./rustfs')

//桶
const bucket = config.rustfs.BUCKET

async function ensureBucket() {
    try{
        //确认桶是否存在，可访问
        await internalClient.send(
            new HeadBucketCommand({ Bucket: bucket }),
        )
        console.log(`桶已存在：${bucket}`);
        return
    }catch(err){
        const status = err.$metadata?.httpStatusCode
        if(status !== 404)  throw err//403等错误直接抛出
    }
    //创建桶
    await internalClient.send(
        new CreateBucketCommand({ Bucket: bucket }),
    )
    console.log(`桶已创建：${bucket}`)
}
//跨域
async function ensureCors() {
    await internalClient.send(
        new PutBucketCorsCommand({
            Bucket: bucket,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedOrigins: [
                            config.rustfs.CORS_ORIGIN,
                        ],
                        AllowedMethods: [
                            'GET',
                            'HEAD',
                            'PUT',
                        ],
                        AllowedHeaders: ['*'],
                        ExposeHeaders: ['ETag'],
                        MaxAgeSeconds: 3600,
                    },
                ],
            },
        }),
    )
    console.log(`CORS 已配置：${config.rustfs.CORS_ORIGIN}`)
}
// 公开阅读
async function ensurePublicReadPolicy() {
    const policy = {
        Version: '2012-10-17',
        Statement: [
            {
                Sid: 'PublicReadOnlyPrefix',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [
                    `arn:aws:s3:::${bucket}/public/*`,
                ],
            },
        ],
    }
    await internalClient.send(
        new PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: JSON.stringify(policy),
        }),
    )
    console.log('公开读取策略已配置：public/*')
}

async function main() {
    await ensureBucket()
    await ensureCors()
    await ensurePublicReadPolicy()

    console.log('RustFS 初始化完成')
}
//失败
main().catch((error) => {
    console.error('RustFS 初始化失败：', error)
    process.exit(1)
})