import axios, { AxiosInstance } from 'axios'

const origin = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://localhost:3000'

export const api: AxiosInstance = axios.create({
  baseURL: `${origin}/api`,
})

api.interceptors.request.use(
  (req) => {
    // console.log('request', axios.getUri(req))
    return req
  },
)
