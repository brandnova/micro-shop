import client from './client'

export const getProducts = () => client.get('/api/products/')

export const getAllProducts = () => client.get('/api/products/?status=all')

// Fetches all pages of active products for the storefront.
// DRF paginates at 20 — this walks every page and returns the full list.
export const getAllActiveProducts = async () => {
  const allProducts = []
  let url = '/api/products/'

  while (url) {
    const res = await client.get(url)
    const data = res.data

    if (Array.isArray(data)) {
      // Pagination is off — single response
      allProducts.push(...data)
      break
    }

    // Paginated response: { count, next, previous, results }
    allProducts.push(...(data.results ?? []))

    // `next` is an absolute URL like http://localhost:8001/api/products/?page=2
    // Extract just the path+query so the axios baseURL doesn't double up
    if (data.next) {
      try {
        const nextUrl = new URL(data.next)
        url = nextUrl.pathname + nextUrl.search
      } catch {
        url = null
      }
    } else {
      url = null
    }
  }

  return allProducts
}

export const createProduct      = (data)           => client.post('/api/products/', data)
export const updateProduct      = (id, data)        => client.patch(`/api/products/${id}/`, data)
export const deleteProduct      = (id)              => client.delete(`/api/products/${id}/`)
export const uploadProductImages = (id, formData)   =>
  client.post(`/api/products/${id}/upload-images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const setPrimaryImage    = (id, imageId)     =>
  client.post(`/api/products/${id}/set-primary-image/`, { image_id: imageId })
export const deleteProductImage = (id, imageId)     =>
  client.delete(`/api/products/${id}/delete-image/`, { data: { image_id: imageId } })