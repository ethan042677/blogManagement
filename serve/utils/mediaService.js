const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')
const FileType = require('file-type')
const { Op } = require('sequelize')
const formatDate = require('./formatDate')

const config = require('../config/default')
const {
    LocalFile,
    Category,
} = require('../models/sequelize')

const {
    createPresignedPut,
    headObject,
    getObject,
    putBuffer,
    deleteObject,
    publicUrl,
} = require('../storage/rustfs')

const MIME_EXTENSION = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'application/pdf': 'pdf',
}
//预设三个宽度
const IMAGE_WIDTHS = [480, 1280, 1920]
//报错
function httpError(status, message) {
    const error = new Error(message)
    error.status = status
    return error
}
//日期
function monthPath() {
    const now = new Date()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    return `${now.getUTCFullYear()}-${month}`
}
//文件返回格式
function parseVariants(variants) {
    //variants不存在时
    if(!variants) return []
    //如果variants已经是数组，直接返回variants
    if(Array.isArray(variants)) return variants;
    //variants存在，并且不是数组
    try {
        const parsed = JSON.parse(variants)
        // 如果是json，直接返回，如果不是json，返回空数组
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        //解析失败（可能并不是json字符串,或者类json格式）
        return []
    }
}
// 将Sequelize 实例统一成普通对象
function serializeFile(file){
    // 如果file是sequelize实例
    const data = typeof file.toJSON === 'function' ? file.toJSON() : {...file}
    data.variants = parseVariants(data.variants).map(variant => {
        return {
            ...variant,
            //有key,说明已经存入RustFS中，拼接成前端可访问的url
            url:variant.key ? publicUrl(variant.key) : ''
        }
    })
    return data
}

//生成预签名URL
async function presignUpload(body) {
    //获取文件名
    const originalName = path.basename(String(body.fileName||''))
    const mimeType = String(body.mimeType || '').toLowerCase()
    const size = Number(body.size)
    const categoryId = Number(body.categoryId)
    //文件实际扩展名
    const extension = MIME_EXTENSION[mimeType]

    if(!originalName) throw httpError(400,'文件名不能为空')
    if(!extension) throw httpError(400,'只允许上传PDF和图片')
    if(!Number.isInteger(size) || size < 0) throw httpError(400,'文件大小不合法')
    if(size > config.rustfs.MAX_FILE_SIZE) throw httpError(400,'文件大小超过限制')
    if(Number.isInteger(categoryId) && categoryId >= 0){
        const category = await Category.findByPk(categoryId)
        if(!category) throw httpError(400,'文件分类不存在')
    }

    //解析路径
    const parsed = path.parse(originalName)
    //生成文件路径
    const storageKey = `staging/${monthPath()}/${crypto.randomUUID()}/original.${extension}`
    // 在数据表中建立存储记录
    const file = await LocalFile.create({
        url: '',                          // NOT NULL 约束，pending 占位
        fileName: parsed.name.slice(0, 100),
        format: extension,
        categoryId: categoryId >= 0 ? categoryId : null,
        moment: formatDate(), // 字符串
        storageBucket: config.rustfs.BUCKET,
        storageKey,
        mimeType,
        sizeBytes: size,
        status: 'pending',
        etag: null,
        variants: null,
        errorMessage: null,
        updatedAt: new Date(),            // Date 对象
    })

    // 生成临时URL签名
    try {
        const uploadUrl = await createPresignedPut({ key: storageKey, mimeType, size })
        return {
            id: file.id,
            method: 'PUT',
            url: uploadUrl,
            headers: { 'Content-Type': mimeType },
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        }
    } catch (error) {
        await file.destroy().catch(() => {})
        throw error
    }
}

//浏览器完成上传后，确认是否真的存入RustFS
async function confirmUpload (id){
    //查ID
    const fileId = Number(id)
    if(!Number.isInteger(fileId)) throw httpError(400,"文件ID不合法")
    //查记录
    const file = await LocalFile.findByPk(fileId)
    if(!file) throw httpError(400,'上传记录不存在')
    //状态幂等分支，提前返回
    if(file.status === 'ready'){
        return {
            id:file.id,
            status:file.status,
            file:serializeFile(file)
        }
    }
    //处理中
    if(file.status === 'processing'){
        return {
            id:file.id,
            status:file.status,
            file:null
        }
    }
    //上传失败
    if(file.status === 'failed'){
        throw httpError(409, file.errorMessage || '上传失败')
    }

    //headObject 校验元信息
    let head;
    try {
        head = await headObject(file.storageKey) 
    } catch (error) {
        throw httpError(409, 'RustFS 中尚未找到上传文件')
    }
    //文件大小校验
    if(Number(head.ContentLength) !== Number(file.sizeBytes)){
        file.status = 'failed'
        file.errorMessage = '文件大小与声明不一致'
        file.updatedAt = new Date()
        await file.save()//写入数据库
        await deleteObject(file.storageKey)
        throw httpError(400,file.errorMessage)
    }
    //文件扩展名校验
    const actualMime = String(head.ContentType || '').split(';')[0].toLowerCase()
    if(actualMime && actualMime !== file.mimeType){
        file.status = 'failed'
        file.errorMessage = '文件扩展与声明不一致'
        file.updatedAt = new Date()
        await file.save()//写入数据库
        await deleteObject(file.storageKey)
        throw httpError(400,file.errorMessage)
    }
    // ？处理并发抢占文件处理权
    const [affected] = await LocalFile.update(
        { status: 'processing', etag: head.ETag || null, updatedAt: new Date() },
        { where: { id: fileId, status: 'pending' } }
    )
    if (affected === 0) {
        const latest = await LocalFile.findByPk(fileId)
        return { id: latest.id, status: latest.status, file: latest.status === 'ready' ? serializeFile(latest) : null }
    }
    //入队
    enqueueProcessing(fileId)

    return {
        id: file.id,
        status: 'processing',
        file: null,
    }
}
// 查询处理状态
async function getUploadStatus(id) {
    const fileId = Number(id)
    if (!Number.isInteger(fileId)) throw httpError(400, '文件 ID 不合法')
    const file = await LocalFile.findByPk(fileId)
    if (!file) throw httpError(404, '上传记录不存在')
    return {
        id: file.id,
        status: file.status,
        errorMessage: file.errorMessage,
        file: file.status === 'ready' ? serializeFile(file) : null
    }
}
//处理PDF
async function savePdf(file,buffer) {
    //路径
    const key = `public/files/${monthPath()}/${file.id}/original.pdf`
    // 回写服务端
    const result = await putBuffer({
        key,
        body:buffer,
        contentType:'application/pdf'
    })
    //修改内存中的file,最后在processFile()中统一处理
    file.url = publicUrl(key)
    file.storageKey = key
    file.format = 'pdf'
    file.mimeType = 'application/pdf'
    file.sizeBytes = buffer.length
    file.variants = null
    file.etag = result.ETag || null
    
    return key
}
//图片转webp格式，减小存储开销
async function saveImage (file,buffer,detectedMime) {
    if(detectedMime !== file.mimeType) throw new Error('图片实际类型与声明类型不符')
    //解码，返回图片大小,宽高等格式信息
    const metadata = await sharp(buffer,{
        limitInputPixels: 100_000_000,
    }).metadata()
    if(!metadata.width || !metadata.height) throw new Error('无法读取图片尺寸')
    //过滤掉预设宽度数组中比实际大的宽度值，并保存当前宽度值，去重得到新的宽度数组并排序
    const widths = [
                        ...new Set([
                            ...IMAGE_WIDTHS.filter(width => width < metadata.width),
                            metadata.width
                        ])
                ].sort((a,b) => a - b)
    //收集变体，方便读取不同尺寸的图片
    const variants = [];
    //记录已经写入的key
    const createdKeys = [];
    try {
        //逐宽度转码
        for(const width of widths){
            const output = await sharp(buffer)
                .rotate()
                .resize({ width, withoutEnlargement: true })
                .webp({ quality: 82 })
                .toBuffer({ resolveWithObject: true })

            //生成路径
            const key = `public/images/${monthPath()}/${file.id}/${width}.webp`
            //写入服务器
            const result = await putBuffer({
                    key,
                    body: output.data,
                    contentType: 'image/webp',
                })
            //记录
            createdKeys.push(key)
            //以供判断
            function variantName(width, originalWidth) {
                if (width === originalWidth) return 'original'
                if (width <= 480) return 'thumb'
                if (width <= 1280) return 'medium'
                return 'large'
            }
            //收集变体
            variants.push({
                    name: variantName(width,metadata.width),
                    key,
                    mimeType: 'image/webp',
                    width: output.info.width,
                    height: output.info.height,
                    sizeBytes: output.data.length,
                    etag: result.ETag || null,
                })
        }
    } catch (error) {
        //失败则清除
        await Promise.allSettled(createdKeys.map((key) => deleteObject(key)))
        throw error
    }
    //优先取原大，没有就取最大尺寸，实际有BUG，但是不影响前端取
    const canonical = variants.find((item) => item.name === 'medium') || variants[variants.length - 1]
    //写入内存中的file,即更新数据库记录
    file.url = publicUrl(canonical.key)
    file.storageKey = canonical.key
    file.format = 'webp'
    file.mimeType = 'image/webp'
    file.sizeBytes = canonical.sizeBytes
    file.etag = canonical.etag || null
    file.variants = variants
    //返回所有写入的key
    return createdKeys
}

//将可读流拼成buffer
async function streamToBuffer(stream) {
    const chucks = []
    try{
        for await (const chuck of stream){
            chucks.push(chuck)
        }
        //合并为一个新Buffer
        return Buffer.concat(chucks)
    }finally{
        //无论成功和失败都销毁stream，释放内存
        stream.destroy?.()
    }
}

/**
 * 读staging -> 校验 -> 转存 -> 标记 -> 删staging
 * @param {*} fileId 
 */
async function processFile(fileId) {
    //读指定file，不存在或者状态为ready直接返回
    const file = await LocalFile.findByPk(fileId)
    if(!file || file.status === 'ready') return ;
    
    const stagingKey = file.storageKey//暂存区对象的key，即待处理文件
    const createdKeys = []//回滚清单，以备失败时精准清除

    try {
        if(!stagingKey) throw new Error('缺少 staging storageKey')
        //读取指定对象，判断流大小，合规再转buffer
        const response = await getObject(stagingKey)
        if(Number(response.ContentLength) > config.rustfs.MAX_FILE_SIZE) throw new Error('文件超出大小限制')
        
        const buffer = await streamToBuffer(response.Body)
        //双重检验，防止篡改文件大小
        if(buffer.length > config.rustfs.MAX_FILE_SIZE) throw new Error('文件超出大小限制')
        //使用file-type匹配真实文件格式
        const detected = await FileType.fromBuffer(buffer)
        if(!detected) throw new Error('无法识别真实类型')
        
        const ALLOWED_MIME = new Set(
            ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/avif',]
        )
        if(!ALLOWED_MIME.has(detected.mime)) throw new Error('只能上传指定格式的文件')
        //分流转存
        if(detected.mime === 'application/pdf'){
            createdKeys.push(await savePdf(file,buffer))
        }else{
            createdKeys.push(...await saveImage(file,buffer,detected.mime))
        }
        //提交成功
        file.status = 'ready'
        file.errorMessage = null
        file.updatedAt = new Date()

        await file.save()
        //删除暂存区
        await deleteObject(stagingKey).catch((err) => {
            console.error('[processFile] 删 staging 失败', stagingKey, err.message)
        })
    } catch (error) {
        //删除暂存
        await Promise.allSettled(createdKeys.map(key => deleteObject(key)))
        await deleteObject(stagingKey).catch(()=>{})
        //提交失败
        file.status = 'failed'
        file.errorMessage = String(error.message).slice(0, 1000)
        file.updatedAt = new Date()
        //错误信息写入LocalFile
        await file.save().catch((err) => {
            console.error('[processFile] 置 failed 保存失败', fileId, err.message)
        })
        throw error
    }
}
//.then()立即执行
let processingChain = Promise.resolve()
//处理队列
function enqueueProcessing (fileId) {
    processingChain = processingChain.then(() => processFile(fileId)).catch(error => {
        console.error(`文件处理失败 ${fileId}:`, error.message)
    })
}
//服务重启时：查询processing的记录，重新入队
async function recoverProcessingFiles() {
    const files = await LocalFile.findAll({
        where: { status: 'processing' },
        attributes: ['id'],
    })
    files.forEach(file => {
        enqueueProcessing(file.id)
    })
}
//批量清理函数
async function deleteStoredFiles(files) {
    //待清理集合
    const keys = new Set()
    for(const file of files){
        if(file.storageKey) {
            keys.add(file.storageKey)
        }
        for(const variant of parseVariants(file.variants)){
                if(variant.key){
                    keys.add(variant.key)
                }
        }
    }
    await Promise.all(
        [...keys].map(key => deleteObject(key))
    )
}

module.exports = {
    presignUpload,
    confirmUpload,
    getUploadStatus,
    recoverProcessingFiles,
    serializeFile,
    deleteStoredFiles,
}
