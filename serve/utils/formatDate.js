// [联调修复] 本项目是 CommonJS，改为 module.exports，避免 ESM export 语法在 require 时报错。
const formatDate = () => {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth()+1}-${String(date.getDate()).padStart(2,"0")} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}:${String(date.getSeconds()).padStart(2,"0")}`
}

module.exports = formatDate
