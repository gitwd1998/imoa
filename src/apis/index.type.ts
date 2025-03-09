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

interface WorkingHoursItem {
  id: number | string
  userId: string
  nickName: string | null
  hourlyWage: string | null
  workingDate: Date | null
  workingHours: string | number | null
  createTime: Date | null
  createUser: string | null
  updateTime: Date | null
  updateUser: string | null
}
interface SelectWorkingHoursApi {
  (params: {
    userId: string
    workingStartDate: string
    workingEndDate: string
  }): Promise<ApiResponse<WorkingHoursItem[]>>
}

interface ConsumptionRecordItem {
  id: number | string | null
  userId: string | null
  consumptionTime: Date | null
  consumptionAmount: string | null
  consumptionType: string | null
  consumptionRemark: string | null
  createTime?: Date | null
  createUser?: string | null
  updateTime?: Date | null
  updateUser?: string | null
}

interface ConsumptionRecordSelectApi {
  (params: {
    startDate: string
    endDate: string
  }): Promise<ApiResponse<ConsumptionRecordItem[]>>
}

interface ConsumptionRecordSaveApi {
  (data: ConsumptionRecordItem): Promise<ApiResponse<void>>
}

interface ConsumptionRecordDeleteApi {
  (params: {
    id: string | number
  }): Promise<ApiResponse<void>>
}
