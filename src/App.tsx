import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { store } from '@/stores/store'
import '@/styles/index.css'

function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#3b82f6',
            },
          }}
        >
          <div className="w-full min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                AI Art Gallery
              </h1>
              <p className="text-gray-400 mb-8">AI 艺术画廊 - 项目初始化成功</p>
              <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-blue-400">✅ 技术栈确认</h2>
                <ul className="text-left text-sm space-y-2 text-gray-300">
                  <li>✅ React 18.2 + TypeScript 5 (strict)</li>
                  <li>✅ Vite 5 构建工具</li>
                  <li>✅ Three.js r160 + React Three Fiber 8</li>
                  <li>✅ Redux Toolkit + RTK Query</li>
                  <li>✅ Tailwind CSS 4.x</li>
                  <li>✅ Ant Design 6.0</li>
                </ul>
              </div>
            </div>
          </div>
        </ConfigProvider>
      </Provider>
    </StrictMode>
  )
}

export default App
