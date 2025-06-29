import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

export interface Admin {
	id: number
	firstName: string
	lastName: string
	login: string
	role: string
	city: string
	createdAt: string
	updatedAt: string
	createdBy?: number
	creator?: {
		id: number
		firstName: string
		lastName: string
		login: string
	}
}

export interface CreateAdminData {
	firstName: string
	lastName: string
	login: string
	password: string
	role: string
	city: string
}

export interface UpdateAdminData {
	firstName?: string
	lastName?: string
	login?: string
	role?: string
	city?: string
}

export interface CreateAdminResponse {
	admin: Admin
	plainPassword: string
}

class AdminsApi {
	private getAuthHeaders() {
		const token = localStorage.getItem('jwt')
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	async getAdmins(): Promise<Admin[]> {
		const response = await axios.get(`${API_BASE_URL}/admins`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getAdmin(id: number): Promise<Admin> {
		const response = await axios.get(`${API_BASE_URL}/admins/${id}`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async createAdmin(data: CreateAdminData): Promise<CreateAdminResponse> {
		const response = await axios.post(`${API_BASE_URL}/admins`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async updateAdmin(id: number, data: UpdateAdminData): Promise<Admin> {
		const response = await axios.put(`${API_BASE_URL}/admins/${id}`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async deleteAdmin(id: number): Promise<void> {
		await axios.delete(`${API_BASE_URL}/admins/${id}`, {
			headers: this.getAuthHeaders(),
		})
	}

	async blockAdmin(id: number): Promise<Admin> {
		const response = await axios.patch(
			`${API_BASE_URL}/admins/${id}/block`,
			{},
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	async unblockAdmin(id: number): Promise<Admin> {
		const response = await axios.patch(
			`${API_BASE_URL}/admins/${id}/unblock`,
			{},
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}
}

const adminsApi = new AdminsApi()
export default adminsApi
