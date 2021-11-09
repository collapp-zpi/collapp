import request from 'shared/utils/request'

export const updateSpace = (id: string) => (data: any) =>
  request.patch(`/api/spaces/${id}`, data)

export const createSpace = (data: any) => request.post('/api/spaces', data)
