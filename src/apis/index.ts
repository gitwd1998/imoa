import request from '@/utils/request'

export const jscode2session: Jscode2sessionApi = (params) => {
  return request.get('/miniprograme/jscode2session', { params })
}
export function getuserphonenumber(params: any) {
  return request.get('/miniprograme/getuserphonenumber', { params })
}

export const selectWorkingHours: SelectWorkingHoursApi = (data) => {
  return request.post('/workingHours/select', data)
}

export function insertWorkingHours(data: any) {
  return request.post('/workingHours/insert', data)
}

export function updateWorkingHours(data: any) {
  return request.post('/workingHours/update', data)
}

export function deleteWorkingHours(params: any) {
  return request.get('/workingHours/delete', { params })
}

export const consumptionRecordSelect: ConsumptionRecordSelectApi = (params) => {
  return request.get('/consumptionRecord/select', { params })
}

export const consumptionRecordSave: ConsumptionRecordSaveApi = (data) => {
  return request.post('/consumptionRecord/save', data)
}

export const consumptionRecordDelete: ConsumptionRecordDeleteApi = (params) => {
  return request.delete('/consumptionRecord/delete', { params })
}

export const consumptionRecordDetail: ConsumptionRecordDetailApi = (params) => {
  return request.get('/consumptionRecord/detail', { params })
}

export const consumptionRecordBatchSave: ConsumptionRecordBatchSaveApi = (data) => {
  return request.post('/consumptionRecord/batchSave', data)
}

export const consumptionRecordExport: ConsumptionRecordExportApi = (params) => {
  return request.download({
    url: '/consumptionRecord/export',
    params,
    responseType: 'arraybuffer',
  })
}

export const consumptionRecordImport: ConsumptionRecordImportApi = (filePath) => {
  return request.upload({
    url: '/consumptionRecord/export',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    filePath,
  })
}

export const consumptionTypeSelect: ConsumptionTypeSelectApi = () => {
  return request.get('/consumptionType/select')
}

export const consumptionTypeSave: ConsumptionTypeSaveApi = (data) => {
  return request.post('/consumptionType/save', data)
}

export const consumptionTypeDelete: ConsumptionTypeDeleteApi = (params) => {
  return request.delete('/consumptionType/delete', { params })
}
