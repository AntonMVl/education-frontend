import axios from 'axios'
import { apiUrl } from '../constants/urlConstants'

// Типы для админки
export interface AdminUser {
	id: number
	login: string
	firstName: string
	lastName: string
	city: string
	role: string
	status?: string
	createdAt?: string
	createdBy?: number
	creator?: {
		id: number
		firstName: string
		lastName: string
		login: string
	}
}

export interface CreateUserData {
	firstName: string
	lastName: string
	login: string
	role: string
	city: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
	status?: string
	password?: string
}

class AdminApi {
	private _url: string

	constructor() {
		this._url = apiUrl
	}

	private getAuthHeaders() {
		const token = localStorage.getItem('jwt')
		if (!token) {
			throw new Error('Токен авторизации не найден')
		}
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	// Получение списка всех пользователей
	async getUsers(): Promise<AdminUser[]> {
		try {
			console.log('Запрос пользователей:', `${this._url}/admin/users`)
			const response = await axios.get(`${this._url}/admin/users`, {
				headers: this.getAuthHeaders(),
			})
			console.log('Ответ getUsers:', response.data)
			return response.data
		} catch (error: any) {
			console.error('Ошибка getUsers:', error.response?.data || error.message)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}

	// Создание нового пользователя
	async createUser(
		userData: CreateUserData
	): Promise<{ user: AdminUser; plainPassword: string }> {
		try {
			console.log('Создание пользователя:', userData)
			const response = await axios.post(`${this._url}/admin/users`, userData, {
				headers: this.getAuthHeaders(),
			})
			console.log('Ответ createUser:', response.data)
			return response.data
		} catch (error: any) {
			console.error('Ошибка createUser:', error.response?.data || error.message)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}

	// Обновление пользователя
	async updateUser(id: number, userData: UpdateUserData): Promise<AdminUser> {
		try {
			console.log('Обновление пользователя:', id, userData)
			const response = await axios.put(
				`${this._url}/admin/users/${id}`,
				userData,
				{
					headers: this.getAuthHeaders(),
				}
			)
			console.log('Ответ updateUser:', response.data)
			return response.data
		} catch (error: any) {
			console.error('Ошибка updateUser:', error.response?.data || error.message)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}

	// Удаление пользователя
	async deleteUser(id: number): Promise<void> {
		try {
			console.log('Удаление пользователя:', id)
			await axios.delete(`${this._url}/admin/users/${id}`, {
				headers: this.getAuthHeaders(),
			})
			console.log('Пользователь успешно удален')
		} catch (error: any) {
			console.error('Ошибка deleteUser:', error.response?.data || error.message)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}

	// Блокировка/разблокировка пользователя
	async toggleUserStatus(
		id: number,
		status: 'active' | 'blocked'
	): Promise<AdminUser> {
		try {
			console.log('Изменение статуса пользователя:', id, status)
			const response = await axios.patch(
				`${this._url}/admin/users/${id}/status`,
				{ status },
				{
					headers: this.getAuthHeaders(),
				}
			)
			console.log('Ответ toggleUserStatus:', response.data)
			return response.data
		} catch (error: any) {
			console.error(
				'Ошибка toggleUserStatus:',
				error.response?.data || error.message
			)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}

	// Получение статистики
	async getStats(): Promise<any> {
		try {
			console.log('Запрос статистики:', `${this._url}/admin/stats`)
			const response = await axios.get(`${this._url}/admin/stats`, {
				headers: this.getAuthHeaders(),
			})
			console.log('Ответ getStats:', response.data)
			return response.data
		} catch (error: any) {
			console.error('Ошибка getStats:', error.response?.data || error.message)
			console.error('Статус:', error.response?.status)
			throw error
		}
	}
}

const adminApi = new AdminApi()
export default adminApi
