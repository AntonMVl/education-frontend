import { apiUrl } from '../constants/urlConstants'

export interface Answer {
	id: number
	text: string
	is_correct: boolean
	questionId: number
}

export interface Question {
	id: number
	text: string
	lectureId: string
	lecture?: {
		id: string
		title: string
		course?: {
			id: string
			title: string
		}
	}
	answers: Answer[]
	createdAt: string
	updatedAt: string
}

interface CreateAnswerData {
	text: string
	isCorrect: boolean
}

interface CreateQuestionData {
	text: string
	lectureId: string
	answers: CreateAnswerData[]
}

interface UpdateQuestionData {
	text?: string
	lectureId?: string
	answers?: CreateAnswerData[]
}

export const createQuestion = async (questionData: CreateQuestionData) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(questionData),
	})

	if (!response.ok) {
		throw new Error('Ошибка при создании вопроса')
	}

	return response.json()
}

export const getQuestions = async () => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке вопросов')
	}

	return response.json()
}

export const getQuestionsByLecture = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question/lecture/${lectureId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке вопросов лекции')
	}

	return response.json()
}

export const getQuestion = async (questionId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question/${questionId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке вопроса')
	}

	return response.json()
}

export const updateQuestion = async (
	questionId: string,
	questionData: UpdateQuestionData
) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question/${questionId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(questionData),
	})

	if (!response.ok) {
		throw new Error('Ошибка при обновлении вопроса')
	}

	return response.json()
}

export const deleteQuestion = async (questionId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/question/${questionId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		const errorMessage = errorData.message || `Ошибка ${response.status}: ${response.statusText}`
		throw new Error(errorMessage)
	}

	return response.json()
}

// Default экспорт
const questionsApi = {
	createQuestion,
	getQuestions,
	getQuestionsByLecture,
	getQuestion,
	updateQuestion,
	deleteQuestion,
}

export default questionsApi
