import request from '@/utils/request'

export const jscode2session: Jscode2sessionApi = (params) => {
  return request.get('/miniprograme/jscode2session', { params })
}
export function getuserphonenumber(params: any) {
  return request.get('/miniprograme/getuserphonenumber', { params })
}

export function selectWorkingHours(data: any) {
  return request({
    method: 'post',
    url: '/workingHours/select',
    data,
  })
}

export function insertWorkingHours(data: any) {
  return request({
    method: 'post',
    url: '/workingHours/insert',
    data,
  })
}

export function updateWorkingHours(data: any) {
  return request({
    method: 'post',
    url: '/workingHours/update',
    data,
  })
}

export function deleteWorkingHours(params: any) {
  return request({
    method: 'get',
    url: '/workingHours/delete',
    params,
  })
}
