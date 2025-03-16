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
  workingDate: string | null
  workingHours: string | number | null
  createTime: string | null
  createUser: string | null
  updateTime: string | null
  updateUser: string | null
}
interface SelectWorkingHoursApi {
  (params: {
    userId: string
    workingStartDate: string
    workingEndDate: string
  }): Promise<ApiResponse<WorkingHoursItem[]>>
}

/* ********************************************************************** */
interface ConsumptionRecord<T = string> {
  id: number | string
  userId?: string
  consumptionTime: T
  consumptionAmount: string
  consumptionType: string
  consumptionRemark: string
  createTime?: string
  createUser?: string
  updateTime?: string
  updateUser?: string
}

interface ConsumptionRecordSelectApi {
  (params: {
    startDate: string
    endDate: string
  }): Promise<ApiResponse<ConsumptionRecord[]>>
}

interface ConsumptionRecordSaveApi {
  (data: ConsumptionRecord): Promise<ApiResponse<void>>
}

interface ConsumptionRecordDeleteApi {
  (params: {
    id: string | number
  }): Promise<ApiResponse<void>>
}

interface ConsumptionRecordBatchSaveApi {
  (data: ConsumptionRecord[]): Promise<ApiResponse<void>>
}
interface ConsumptionRecordDetailApi {
  (params: {
    id: string | number
  }): Promise<ApiResponse<ConsumptionRecord>>
}

interface ConsumptionRecordExportApi {
  (params: {
    startDate: string
    endDate: string
  }): Promise<{
    filePath: string
    tempFilePath: string
  }>
}

interface ConsumptionRecordImportApi {
  (filePath: string): Promise<ApiResponse<void>>
}

/* ********************************************************************** */
interface ConsumptionType {
  id: number | string
  userId?: string
  consumptionType: string
  createTime?: string
  createUser?: string
  updateTime?: string
  updateUser?: string
}

interface ConsumptionTypeSelectApi {
  (): Promise<ApiResponse<ConsumptionType[]>>
}

interface ConsumptionTypeSaveApi {
  (data: ConsumptionType): Promise<ApiResponse<void>>
}

interface ConsumptionTypeDeleteApi {
  (params: {
    id: string | number
  }): Promise<ApiResponse<void>>
}
