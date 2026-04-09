import client from './client'

export const verifyAdmin = (token) => client.post('/api/verify-admin/', { token })