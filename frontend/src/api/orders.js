import client from './client'

export const getOrders = (params) => client.get('/api/orders/', { params })

export const createOrder = (data) => client.post('/api/orders/', data)

export const updateOrderStatus = (id, status, note = '') =>
  client.patch(`/api/orders/${id}/`, { status, status_note: note })

export const trackOrder = (trackingCode) =>
  client.get('/api/orders/track/', { params: { tracking_code: trackingCode } })

export const uploadPaymentProof = (trackingCode, file) => {
  const formData = new FormData()
  formData.append('tracking_code', trackingCode)
  formData.append('payment_proof', file)
  return client.post('/api/orders/upload-proof/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}