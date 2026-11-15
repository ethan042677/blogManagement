// 静态引入图标，交给 Vite 打包并生成带 hash 的产物地址。
// 不能用运行时拼接的 './src/assets/...' 字符串：打包后 src 目录不会发布到服务器。
import sun from '../assets/weather/sun.svg'
import cloudy from '../assets/weather/cloudy.svg'
import overcast from '../assets/weather/overcast.svg'
import smog from '../assets/weather/smog.svg'
import rain from '../assets/weather/rain.svg'
import thunderstorm from '../assets/weather/thunderstorm.svg'
import snow from '../assets/weather/snow.svg'
import wind from '../assets/weather/wind.svg'

// 日记页面可选择的天气列表
export const weatherList = [
    {
        id:0,
        name:'晴天',
        icon:sun
    },
    {
        id:1,
        name:'多云',
        icon:cloudy
    },
    {
        id:2,
        name:'阴天',
        icon:overcast
    },
    {
        id:3,
        name:'雾霾',
        icon:smog
    },
    {
        id:4,
        name:'下雨',
        icon:rain
    },
    {
        id:5,
        name:'雷雨',
        icon:thunderstorm
    },
    {
        id:6,
        name:'下雪',
        icon:snow
    },
    {
        id:7,
        name:'有风',
        icon:wind
    }
]
