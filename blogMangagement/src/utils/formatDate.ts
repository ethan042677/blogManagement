export const formatDate = ():string => {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth()+1}-${String(date.getDate()).padStart(2,"0")} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}:${String(date.getSeconds()).padStart(2,"0")}`
}