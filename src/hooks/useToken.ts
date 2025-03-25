export const setToken = (token: string) => {
  localStorage.setItem('access_token', token)
}

export const fetchToken = (): string | null => {
  return localStorage.getItem('access_token')
}

export const removeToken = () => {
  return localStorage.removeItem('access_token')
}