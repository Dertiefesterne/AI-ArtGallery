import { useState } from 'react'
import { Form, Input, Button, Card, App } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { login as apiLogin } from '@/api/auth'
import { setCredentials } from '@/stores/authSlice'

export default function Login() {
  const { message } = App.useApp()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const { token, user } = await apiLogin(values.email, values.password)
      dispatch(setCredentials({ token, user }))
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (e: any) {
      message.error(e?.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="登录 AI 艺术画廊" style={{ width: 360, margin: '80px auto' }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
        <Button type="link" block onClick={() => navigate('/register')}>
          没有账号？去注册
        </Button>
      </Form>
    </Card>
  )
}
