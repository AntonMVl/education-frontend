import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

export interface Question {
	id: number
	text: string
	lectureId: number
	createdAt: string
	updatedAt: string
}

export interface CreateQuestionData {
	text: string
	lectureId: number
}

export interface UpdateQuestionData {
	text?: string
	lectureId?: number
}

class QuestionsApi {
	private getAuthHeaders() {
		const token = localStorage.getItem('jwt')
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	async getQuestions(): Promise<Question[]> {
		const response = await axios.get(`${API_BASE_URL}/questions`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getQuestion(id: number): Promise<Question> {
		const response = await axios.get(`${API_BASE_URL}/questions/${id}`, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async getQuestionsByLecture(lectureId: number): Promise<Question[]> {
		const response = await axios.get(
			`${API_BASE_URL}/questions/lecture/${lectureId}`,
			{
				headers: this.getAuthHeaders(),
			}
		)
		return response.data
	}

	async createQuestion(data: CreateQuestionData): Promise<Question> {
		const response = await axios.post(`${API_BASE_URL}/questions`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async updateQuestion(
		id: number,
		data: UpdateQuestionData
	): Promise<Question> {
		const response = await axios.put(`${API_BASE_URL}/questions/${id}`, data, {
			headers: this.getAuthHeaders(),
		})
		return response.data
	}

	async deleteQuestion(id: number): Promise<void> {
		await axios.delete(`${API_BASE_URL}/questions/${id}`, {
			headers: this.getAuthHeaders(),
		})
	}
}

const questionsApi = new QuestionsApi()
export default questionsApi
