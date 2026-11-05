// 列表使用短日期，详情评论使用包含时分的时间。
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// 格式化文章与摄影日期；遇到后端非标准时间字符串时保留可读的原始日期。
export function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : dateFormatter.format(date)
}

// 评论发布时间需要精确到分钟。
export function formatDateTime(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

// 日记时间轴把“日”和“月份 / 年份”拆开显示，便于左侧日期栏排版。
export function formatMonthDay(value?: string): { day: string; month: string } {
  if (!value) return { day: '--', month: '--- / ----' }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { day: value.slice(8, 10) || '--', month: `${value.slice(5, 7)} / ${value.slice(0, 4)}` }
  }
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: `${date.toLocaleString('en-US', { month: 'short' }).toUpperCase()} / ${date.getFullYear()}`,
  }
}
