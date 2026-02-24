import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { ConfigProvider, theme, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { store } from '@/stores/store'
import { Gallery } from '@/pages/Gallery'
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
          <AntApp>
            <Gallery />
          </AntApp>
        </ConfigProvider>
      </Provider>
    </StrictMode>
  )
}

export default App
