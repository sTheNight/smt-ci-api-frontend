import axios from 'axios'

export const API_URL = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEVELOPMENT
    : import.meta.env.VITE_API_URL_PRODUCTION

export const MAX_HISTORY_ITEM_NUM = 10

export function getLatestBuild() {
    return axios.get(`${API_URL}/info/latest`)
}
export function getHistoryBuild(page: number = 1) {
    return axios.get(`${API_URL}/history?page=${page}`)
}