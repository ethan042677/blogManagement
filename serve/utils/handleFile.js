const fs = require('fs')
const path = require('path');

exports.deleteFiles = function (url) {
    if (typeof url === 'string') {
        //删除单文件
        fs.unlink(`public/files/${url}`, (err) => {
            if (err) throw err;
            console.log("文件已删除")
        })
    } else {
        //多个文件
        url.map(val => {
            fs.unlink(`public/files/${val}`, (err) => {
                if (err) throw err;
                console.log("文件已删除")
            })
        })
    }
}

/**
 * 异步计算文件夹总大小（并发递归）
 * @param {string} pathUrl - 文件夹路径
 * @returns {Promise<number>} 总字节数
 */
exports.calculateFileSize = async function (pathUrl) {
    /**
     * 内部递归函数
     * @param {string} dirPath - 当前要遍历的目录路径
     */
    async function getFolderSize(dirPath) {
        let totalSize = 0;
        let entries = [];

        // 容错：读取目录时可能会遇到权限不足等问题，直接返回 0 跳过
        try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });
        } catch (err) {
            return 0;
        }

        // 把每个条目映射成 Promise，用 Promise.all 并发等待
        const results = await Promise.all(
            entries.map(async (entry) => {
                const fullPath = path.join(dirPath, entry.name);

                try {
                    if (entry.isDirectory()) {
                        // 子目录：递归，返回其大小
                        return await getFolderSize(fullPath);
                    } else if (entry.isFile()) {
                        // 普通文件：返回文件大小
                        const stats = await fs.stat(fullPath);
                        return stats.size;
                    }
                    // 其他类型（符号链接等）：不计入，返回 0
                    return 0;
                } catch (err) {
                    // 容错：如果某个具体文件 stat 失败（比如刚好被删除），跳过该文件
                    return 0;
                }
            })
        );

        // 将当前目录下所有子项的大小累加
        totalSize = results.reduce((acc, size) => acc + size, 0);
        return totalSize;
    }

    // 调用内部函数，返回字节数
    return await getFolderSize(pathUrl);
};
//换算文件大小
exports.formatSize = function (bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
};