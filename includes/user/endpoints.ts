import request from 'shared/utils/request'

export const updateUser = (data: any) => request.patch(`/api/user`, data)
