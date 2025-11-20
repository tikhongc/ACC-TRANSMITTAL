/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 白色系
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F7F8FA',
        'bg-hover': '#F2F3F5',

        // 文字颜色
        'text-primary': '#1D2129',
        'text-secondary': '#4E5969',
        'text-disabled': '#C9CDD4',

        // 边框
        'border-color': '#E5E6EB',

        // Arco Blue 主题色
        'primary': {
          DEFAULT: '#165DFF',
          light: '#E8F3FF',
          dark: '#0E42D2',
        },

        // 状态颜色
        'status': {
          'draft': '#86909C',
          'sent': '#165DFF',
          'completed': '#00B42A',
          'cancelled': '#F53F3F',
        },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
