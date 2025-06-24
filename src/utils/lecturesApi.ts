import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

export interface Lecture {
	id: number
	title: string
	description: string
	content: string
	order: number
	createdAt: string
	updatedAt: string
}

export interface CreateLectureData {
	title: string
	description: string
	content: string
	order: number
}

export interface UpdateLectureData {
	title?: string
	description?: string
	content?: string
	order?: number
}

class LecturesApi {
	private getAuthHeaders() {
		const token = localStorage.getItem('jwt')
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	async getLectures(): Promise<Lecture[]> {
		const response = await axios.get(`${API_BASE_URL}/lectures`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getLecture(id: number): Promise<Lecture> {
		const response = await axios.get(`${API_BASE_URL}/lectures/${id}`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async createLecture(data: CreateLectureData): Promise<Lecture> {
		const response = await axios.post(`${API_BASE_URL}/lectures`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async updateLecture(id: number, data: UpdateLectureData): Promise<Lecture> {
		const response = await axios.put(`${API_BASE_URL}/lectures/${id}`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async deleteLecture(id: number): Promise<void> {
		await axios.delete(`${API_BASE_URL}/lectures/${id}`, {
			headers: this.getAuthHeaders(),
		})
	}
}

const lecturesApi = new LecturesApi()
export default lecturesApi
