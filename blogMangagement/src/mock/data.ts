import Mock from 'mockjs'

const Random = Mock.Random

// 生成最近N天的日期数组
const generateDates = (days: number): string[] => {
    const dates: string[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        dates.push(
            d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0')
        )
    }
    return dates
}

// 总览数据
export const overViewData = Mock.mock({
    'code': 200,
    'data': {
        'file': Random.float(60, 100, 2, 2) + 'M',
        'article|0-50': 0,
        'gallery|0-50': 0,
        'diary|0-50': 0,
    },
})

// 访问量数据（近30天，用于近一周/近一月切换）
const visitDates = generateDates(30)
export const visitsData = Mock.mock({
    'code': 200,
    [`data|${visitDates.length}`]: visitDates.map((date) => ({
        date,
        'count|50-500': 1,
    })),
})

// 数据监测（设备分布 + 网站内容分布）
export const monitorData = Mock.mock({
    'code': 200,
    'data': {
        'device': [
            { key: 'mobile', name: '移动端', 'value|300-800': 1 },
            { key: 'pc', name: 'PC端', 'value|200-600': 1 },
        ],
        'website': [
            { key: 'file', name: '本地文件', 'value|100-300': 1 },
            { key: 'blog', name: '博客文章', 'value|100-300': 1 },
            { key: 'gallery', name: '摄影图库', 'value|100-300': 1 },
            { key: 'diary', name: '随笔随记', 'value|100-300': 1 },
        ],
    },
})
// 评论
export const comment = Mock.mock({
    "code":200,
    "data":{
        "count":123,
        "list|123":[{
            "id|+1":0,//2
            "article":{
                "id|+1":0,
                "title":"@ctitle(3,6)",
            },
            "user":{
                "id|+1":0,//3
                "name":"@ctitle(3,6)",
                "imgurl":"https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png"
            },
            "comment":"@cparagraph(1,4)",//内容
            "moment":"@datetime()",//时间
            "complaint|0-12":0//举报数
        }],
    },
})
//文章状态
export const articleState = Mock.mock({
    "data":[
        {
            "id":0,
            "name":"已发布",
            "value|0-30":4,
        },
        {
            "id":1,
            "name":"未发布",
            "value|0-30":4,
        }
    ]
})
//分组
export const category = Mock.mock({
    "data":{
        "count":123,
        "list|4":[{
            "id|+1":0,
            "name":"@ctitle(3,6)",
            "value|0-30":4,
            "moment":"@datetime()"
        }]
    }
})

// 图片合集
const photos = [
    "a.png",
    "b.png",
    "c.png",
    "d.png",
    "e.png",
    "f.png",
    "g.png",
    "h.png",
    "i.png",
    "j.png",
    "k.png",
    "l.png",
    "m.png",
    "n.png",
    "o.png",
    "p.png",
    "q.png",
]
//文件数据
export const mkFiles = Mock.mock({
    "count":64,
    "list|64":[
        {
            "id|+1":0,
            "url|1":photos,
            "fileName":"@ctitle(2,12)",
            "format":"jpeg",
            "categoryId|0-3":3,
        }
    ]
})
//标签数据
export const mkLabel = Mock.mock({
    "data":{
        "count":123,
        "list|4":[{
            "id|+1":0,
            "name":"@ctitle(3,6)",
            "moment":"@datetime()"
        }]
    }
})
// 文章数据
export const mkArticle = Mock.mock({
    "count":64,
    "list|64":[
        {
            "id|+1":0,
            "cover|1":photos,
            "categoryId|0-4":3,
            "moment":"@datetime()",
            "title":"@ctitle(4,12)",
            "label|0-3":["@ctitle(2,4)"],
            "introduction":"@cparagraph(1,4)",//内容
            "views|12-429":122,//查看次数
            "state|0-1":0,
            "comment|8-24":11,
            "praise|8-123":42
        }
    ]
})
const photoList = [
    ["a.png"],
    ["b.png","c.png"],
    ["d.png","e.png","f.png"],
    ["g.png","h.png","i.png"],
    ["j.png","k.png","l.png"],
    ["m.png","n.png","o.png"],

]
// 图库数据
export const mkGallery = Mock.mock({
    "count":64,
    "list|64":[
        {
            "id|+1":0,
            "cover|1":photos,
            "categoryId|0-4":3,
            "moment":"@datetime()",
            "title":"@ctitle(4,12)",
            "label|0-3":["@ctitle(2,4)"],
            "introduction":"@cparagraph(1,4)",//内容
            "views|12-429":122,//查看次数
            "content|1":photoList,
            "comment|8-24":11,
            "praise|8-123":42
        }
    ]
})
//随笔随记数据
export const mkDiary = Mock.mock({
    "count":64,
    "list|64":[
        {
            "id|+1":0,
            "cover|1":photos,
            "moment":"@datetime()",
            "title":"@ctitle(4,12)",
            "weatherId|0-7":0,
            "content":"@cparagraph(2,10)",//内容
            "picture|1":photoList,
        }
    ]
})