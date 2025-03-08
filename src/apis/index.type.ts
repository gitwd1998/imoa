/* eslint-disable unused-imports/no-unused-vars */
interface ApiResponse<T> {
  code: string | number | null
  message: string | null
  data?: T
}

interface Jscode2sessionApi {
  (params: { code: string }): Promise<ApiResponse<{
    errcode: string | null
    errmsg: string | null
    openid: string | null
    session_key: string | null
    unionid: string | null
  }>>
}
