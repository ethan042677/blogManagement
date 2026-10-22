// [联调改造] 文件删除改为基于上传目录的异步安全实现，避免路径穿越和异步异常崩溃。
const fs = require('fs');
const path = require('path');

const uploadDirectory = path.resolve(__dirname, '../public/files');

const resolveLocalFile = (url) => {
    // 只取文件名并校验最终路径，阻止 ../ 路径穿越
    const fileName = path.basename(String(url).replace(/^\/files\//, ''));
    const target = path.resolve(uploadDirectory, fileName);
    if (!target.startsWith(`${uploadDirectory}${path.sep}`)) {
        throw new Error('非法的文件路径');
    }
    return target;
};

// 删除本地文件：支持传入单个地址或地址数组
exports.deleteFiles = async (urls) => {
    const list = Array.isArray(urls) ? urls : [urls];
    await Promise.all(list.map(async (url) => {
        // 文件已不存在时视为删除成功，避免重复操作报错
        if (!url) return;
        try {
            await fs.promises.unlink(resolveLocalFile(url));
        } catch (error) {
            if (error.code !== 'ENOENT') console.error('文件删除失败:', error.message);
        }
    }));
};

// 递归计算文件夹大小，用于总览页本地文件容量
exports.calculateFileSize = async (pathUrl) => {
    const getFolderSize = async (dirPath) => {
        let entries;
        try {
            entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        } catch {
            return 0;
        }
        const sizes = await Promise.all(entries.map(async (entry) => {
            const fullPath = path.join(dirPath, entry.name);
            try {
                if (entry.isDirectory()) return getFolderSize(fullPath);
                if (entry.isFile()) return (await fs.promises.stat(fullPath)).size;
                return 0;
            } catch {
                return 0;
            }
        }));
        return sizes.reduce((total, size) => total + size, 0);
    };
    return getFolderSize(pathUrl);
};

// 把字节数转换为 B、KB、MB、GB 等易读格式
exports.formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(2)} ${units[index]}`;
};
