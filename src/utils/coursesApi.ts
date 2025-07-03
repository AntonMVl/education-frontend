import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Типы для курсов
export interface Course {
	id: string
	title: string
	description?: string
	order_number: number
	images: CourseImage[]
	lectures: CourseLecture[]
	isAvailable: boolean
	progress: number
	completed: boolean
}

export interface CourseImage {
	file_path: string
}

export interface CourseLecture {
	id: string
	title: string
}

export interface CreateCourseData {
	title: string
	description?: string
	order_number: number
}

export interface UpdateCourseData {
	title?: string
	description?: string
	order_number?: number
}

// Получить доступные курсы для пользователя
export const getAvailableCourses = async () => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/user-progress/courses/available`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Получить все курсы (для админов)
export const getCourses = async () => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(`${API_BASE_URL}/course`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	return response.data
}

// Создать курс (для админов)
export const createCourse = async (courseData: CreateCourseData) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.post(`${API_BASE_URL}/course`, courseData, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	return response.data
}

// Обновить курс (для админов)
export const updateCourse = async (
	courseId: string,
	courseData: UpdateCourseData
) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.patch(
		`${API_BASE_URL}/course/${courseId}`,
		courseData,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Удалить курс (для админов)
export const deleteCourse = async (courseId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.delete(`${API_BASE_URL}/course/${courseId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	return response.data
}

// Получить прогресс курса
export const getCourseProgress = async (courseId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/user-progress/course/${courseId}/progress`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Получить общий прогресс обучения
export const getOverallProgress = async () => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/user-progress/overall-progress`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Завершить лекцию
export const completeLecture = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.post(
		`${API_BASE_URL}/user-progress/lecture/${lectureId}/complete`,
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Проверить доступность лекции
export const checkLectureAvailability = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/user-progress/lecture/${lectureId}/available`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Получить лекции курса
export const getCourseLectures = async (courseId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/lecture/course/${courseId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Получить лекцию по ID
export const getLecture = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(`${API_BASE_URL}/lecture/${lectureId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	return response.data
}

// Получить случайные вопросы для теста
export const getRandomQuestions = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.get(
		`${API_BASE_URL}/test/lecture/${lectureId}/questions`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Проверить ответы теста
export const checkTestAnswers = async (lectureId: string, answers: any[]) => {
	const token = localStorage.getItem('jwt')
	const response = await axios.post(
		`${API_BASE_URL}/test/lecture/${lectureId}/check`,
		{
			answers,
		},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)
	return response.data
}

// Default экспорт
const coursesApi = {
	getAvailableCourses,
	getCourses,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseProgress,
	getOverallProgress,
	completeLecture,
	checkLectureAvailability,
	getCourseLectures,
	getLecture,
	getRandomQuestions,
	checkTestAnswers,
}

export default coursesApi
