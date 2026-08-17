import client from './client'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
}

export interface AuthResult {
  token: string
  user: AuthUser
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult> {
  const { data } = await client.post<AuthResult>('/api/auth/register', {
    email,
    password,
    name,
  })
  return data
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const { data } = await client.post<AuthResult>('/api/auth/login', { email, password })
  return data
}

export async function getMe(): Promise<{ user: AuthUser }> {
  const { data } = await client.get<{ user: AuthUser }>('/api/auth/me')
  return data
}
