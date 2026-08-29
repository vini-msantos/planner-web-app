import type { Bootstrap, ColumnRoutingPayload, TaskMovePayload } from "./types/dtos"
import axios, { type AxiosInstance } from "axios"

const apiUrl = "http://127.0.0.1:3001"

const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export async function getRequest<T>(path: string): Promise<T | 'error'> {
  try {
    return (await axios.get(`${apiUrl}/${path}`)).data
  } catch { return 'error' }
}

export async function createRequest<P>(path: string, payload: P): Promise<'ok' | 'error'> {
  try {
    const status = (await apiClient.post(`${apiUrl}/${path}`, payload)).status
    return status == 201 ? 'ok' : 'error'
  } catch { return 'error' }
}

export async function deleteRequest(path: string, id: string): Promise<'ok' | 'error'> {
  try {
    const status = (await apiClient.delete(`${apiUrl}/${path}/${id}`)).status
    return status == 200 ? 'ok' : 'error'
  } catch { return 'error' }
}

export async function patchRequest<P>(path: string, id: string, payload: P): Promise<'ok' | 'error'> {
  try {
    const status = (await apiClient.patch(`${apiUrl}/${path}/${id}`, payload)).status
    return status == 200 ? 'ok' : 'error'
  } catch { return 'error' }
}

export async function fetchBootstrap(): Promise<Bootstrap | 'error'> {
  try {
    return (await axios.get<Bootstrap>(apiUrl)).data
  } catch { return 'error' }
}

export async function routeColumn(id: string, payload: ColumnRoutingPayload): Promise<'ok' | 'error'> {
  try {
    const status = (await apiClient.post(`${apiUrl}/columns/${id}/edit-route`, payload)).status
    return status == 200 ? 'ok' : 'error'
  } catch { return 'error' }
}

export async function moveTask(id: string, payload: TaskMovePayload): Promise<'ok' | 'error'> {
  try {
    const status = (await apiClient.post(`${apiUrl}/tasks/${id}/move`, payload)).status
    return status == 200 ? 'ok' : 'error'
  } catch { return 'error' }
} 
