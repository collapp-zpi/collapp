import request from 'shared/utils/request'

export const updateSpace = (id: string) => (data: any) =>
  request.patch(`/api/spaces/${id}`, data)

export const updateSpacePlugins = (id: string) => (data: any) =>
  request.put(`/api/spaces/${id}/plugins`, data)

export const createSpace = (data: any) => request.post('/api/spaces', data)
