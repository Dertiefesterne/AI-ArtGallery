import { useState } from 'react'
import { Form, Input, Button, Card, App } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { register as apiRegister } from '@/api/auth'
import { setCredentials } from '@/stores/authSlice'

export default function Register() {
  const { message } = App.useApp()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string; name?: string }) => {
    setLoading(true)
    try {
      const { token, user } = await apiRegister(values.email, values.password, values.name)
      dispatch(setCredentials({ token, user }))
      message.success('注册成功，已自动登录')
      navigate('/', { replace: true })
    } catch (e: any) {
      message.error(e?.response?.data?.error || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="注册 AI 艺术画廊" style={{ width: 360, margin: '80px auto' }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="昵称">
          <Input placeholder="可选" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}
        >
          <Input.Password placeholder="至少 6 位" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form.Item>
        <Button type="link" block onClick={() => navigate('/login')}>
          已有账号？去登录
        </Button>
      </Form>
    </Card>
  )
}
