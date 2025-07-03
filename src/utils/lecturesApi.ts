import { apiUrl } from '../constants/urlConstants'

export interface Lecture {
	id: string
	title: string
	content: string
	courseId: string
	pdf_file?: string
	has_test: boolean
	createdAt: string
	updatedAt: string
}

export interface CreateLectureData {
	title: string
	content: string
	courseId: string
	pdf_file?: string
	has_test: boolean
}

export interface UpdateLectureData {
	title?: string
	content?: string
	courseId?: string
	pdf_file?: string
	has_test?: boolean
}

export const createLecture = async (lectureData: CreateLectureData, pdfFile?: File) => {
	const token = localStorage.getItem('jwt')
	
	// Сначала создаем лекцию
	const response = await fetch(`${apiUrl}/lecture`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(lectureData),
	})

	if (!response.ok) {
		throw new Error('Ошибка при создании лекции')
	}

	const lecture = await response.json()

	// Если есть PDF файл, загружаем его отдельно
	if (pdfFile && lecture.id) {
		await uploadLecturePdf(lecture.id, pdfFile)
	}

	return lecture
}

export const getLectures = async () => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/lecture`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке лекций')
	}

	return response.json()
}

export const getLecturesByCourse = async (courseId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/lecture/course/${courseId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке лекций курса')
	}

	return response.json()
}

export const getLecture = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/lecture/${lectureId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке лекции')
	}

	return response.json()
}

export const updateLecture = async (
	lectureId: string,
	lectureData: UpdateLectureData,
	pdfFile?: File
) => {
	const token = localStorage.getItem('jwt')
	
	// Обновляем лекцию
	const response = await fetch(`${apiUrl}/lecture/${lectureId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(lectureData),
	})

	if (!response.ok) {
		throw new Error('Ошибка при обновлении лекции')
	}

	const lecture = await response.json()

	// Если есть новый PDF файл, загружаем его
	if (pdfFile) {
		await uploadLecturePdf(lectureId, pdfFile)
	}

	return lecture
}

export const deleteLecture = async (lectureId: string) => {
	const token = localStorage.getItem('jwt')
	const response = await fetch(`${apiUrl}/lecture/${lectureId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка при удалении лекции')
	}

	return response.json()
}

export const uploadLecturePdf = async (lectureId: string, file: File) => {
	const token = localStorage.getItem('jwt')
	const formData = new FormData()
	formData.append('pdf', file)

	const response = await fetch(`${apiUrl}/lecture/${lectureId}/pdf`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке PDF')
	}

	return response.json()
}

export const uploadLectureImage = async (
	lectureId: string,
	file: File,
	altText?: string
) => {
	const token = localStorage.getItem('jwt')
	const formData = new FormData()
	formData.append('image', file)
	if (altText) {
		formData.append('altText', altText)
	}

	const response = await fetch(`${apiUrl}/lecture/${lectureId}/image`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	})

	if (!response.ok) {
		throw new Error('Ошибка при загрузке изображения')
	}

	return response.json()
}

// Default экспорт
const lecturesApi = {
	createLecture,
	getLectures,
	getLecturesByCourse,
	getLecture,
	updateLecture,
	deleteLecture,
	uploadLecturePdf,
	uploadLectureImage,
}

export default lecturesApi
