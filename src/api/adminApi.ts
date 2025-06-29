import axios from 'axios'
import { apiUrl } from '../constants/urlConstants'
import { UserData } from '../types/api'
import {
	AdminPermissionsResponse,
	AdminWithPermissions,
	Permission,
} from '../types/permissions'

class AdminApi {
	private getAuthHeaders() {
		const token = localStorage.getItem('jwt')
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	// Статистика
	async getStats() {
		const response = await axios.get(`${apiUrl}/admin/stats`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	// Пользователи
	async getAllUsers() {
		const response = await axios.get(`${apiUrl}/admin/users`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getUserById(id: number) {
		const response = await axios.get(`${apiUrl}/admin/users/${id}`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async createUser(userData: Partial<UserData>) {
		const response = await axios.post(`${apiUrl}/admin/users`, userData, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async updateUser(id: number, userData: Partial<UserData>) {
		const response = await axios.patch(
			`${apiUrl}/admin/users/${id}`,
			userData,
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	async deleteUser(id: number) {
		const response = await axios.delete(`${apiUrl}/admin/users/${id}`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async toggleUserStatus(id: number) {
		const response = await axios.patch(
			`${apiUrl}/admin/users/${id}/status`,
			{},
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	// Администраторы
	async getAllAdmins(): Promise<AdminWithPermissions[]> {
		const response = await axios.get(`${apiUrl}/admin/admins`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getAdminPermissions(
		adminId: number
	): Promise<AdminPermissionsResponse> {
		const response = await axios.get(
			`${apiUrl}/admin/admins/${adminId}/permissions`,
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	async updateAdminPermissions(
		adminId: number,
		permissions: Permission[]
	): Promise<AdminPermissionsResponse> {
		const response = await axios.patch(
			`${apiUrl}/admin/admins/${adminId}/permissions`,
			{ permissions },
			{ headers: this.getAuthHeaders() }
		)
		return response.data
	}

	// Проверка прав
	async checkPermission(
		permission: Permission
	): Promise<{ hasPermission: boolean }> {
		const response = await axios.get(
			`${apiUrl}/admin/permissions/check/${permission}`,
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	async getMyPermissions(): Promise<Permission[]> {
		const response = await axios.get(`${apiUrl}/admin/permissions/my`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}
}

const adminApi = new AdminApi()
export default adminApi
