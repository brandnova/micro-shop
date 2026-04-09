import client from './client'

export const getSiteSettings = () => client.get('/api/site-settings/')

export const updateSiteSettings = (data) => client.patch('/api/site-settings/1/', data)

export const getBankDetails = () => client.get('/api/bank-details/')

export const updateBankDetails = (id, data) => client.patch(`/api/bank-details/${id}/`, data)

export const healthCheck = () => client.get('/api/health/')