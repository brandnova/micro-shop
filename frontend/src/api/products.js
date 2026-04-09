import client from './client'

export const getProducts = () => client.get('/api/products/')

export const getProduct = (id) => client.get(`/api/products/${id}/`)

export const createProduct = (data) => client.post('/api/products/', data)

export const updateProduct = (id, data) => client.patch(`/api/products/${id}/`, data)

export const deleteProduct = (id) => client.delete(`/api/products/${id}/`)

export const uploadProductImages = (id, formData) =>
  client.post(`/api/products/${id}/upload-images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const setPrimaryImage = (id, imageId) =>
  client.post(`/api/products/${id}/set-primary-image/`, { image_id: imageId })

export const deleteProductImage = (id, imageId) =>
  client.delete(`/api/products/${id}/delete-image/`, { data: { image_id: imageId } })