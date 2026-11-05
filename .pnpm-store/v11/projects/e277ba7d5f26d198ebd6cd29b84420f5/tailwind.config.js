/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3f0e9',
        ink: '#18191d',
        muted: '#6d6d68',
        line: '#d7d1c5',
        cobalt: '#2b5aed',
      },
      fontFamily: {
        editorial: ['Songti SC', 'STSong', 'Noto Serif SC', 'serif'],
        ui: ['Microsoft YaHei', 'PingFang SC', 'sans-serif'],
      },
      maxWidth: {
        reading: '720px',
        site: '1120px',
      },
    },
  },
  plugins: [],
}
