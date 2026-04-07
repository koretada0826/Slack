import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1264a3',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f8f8',
    colorBorder: '#e8e8e8',
    colorText: '#1d1c1d',
    colorTextSecondary: '#616061',
    borderRadius: 4,
    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 15,
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Input: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Modal: {
      borderRadius: 8,
    },
  },
}
