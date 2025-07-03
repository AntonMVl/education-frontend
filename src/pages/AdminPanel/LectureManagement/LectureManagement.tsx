import React, { useEffect, useState } from 'react'
import { getCourses } from '../../../utils/coursesApi'
import {
	deleteLecture,
	getLectures,
	getLecturesByCourse,
} from '../../../utils/lecturesApi'
import LectureModal from '../LectureModal'
import styles from './LectureManagement.module.scss'

interface Course {
	id: string
	title: string
}

interface Lecture {
	id: string
	title: string
	content: string
	course: Course
	courseId: string
	pdf_file?: string
	has_test: boolean
	images: any[]
	createdAt: string
	updatedAt: string
}

const LectureManagement: React.FC = () => {
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)
	const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
	const [showModal, setShowModal] = useState(false)
	const [selectedCourseId, setSelectedCourseId] = useState<string>('')

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		if (selectedCourseId) {
			fetchLecturesByCourse(selectedCourseId)
		} else {
			fetchLectures()
		}
	}, [selectedCourseId])

	const fetchData = async () => {
		try {
			const [lecturesData, coursesData] = await Promise.all([
				getLectures(),
				getCourses(),
			])
			// Преобразуем данные лекций для совместимости
			const transformedLectures = lecturesData.map((lecture: any) => ({
				...lecture,
				courseId: lecture.course?.id || '',
			}))
			setLectures(transformedLectures)
			setCourses(coursesData)
		} catch (error) {
			console.error('Ошибка при загрузке данных:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchLectures = async () => {
		try {
			const data = await getLectures()
			const transformedLectures = data.map((lecture: any) => ({
				...lecture,
				courseId: lecture.course?.id || '',
			}))
			setLectures(transformedLectures)
		} catch (error) {
			console.error('Ошибка при загрузке лекций:', error)
		}
	}

	const fetchLecturesByCourse = async (courseId: string) => {
		try {
			const data = await getLecturesByCourse(courseId)
			const transformedLectures = data.map((lecture: any) => ({
				...lecture,
				courseId: lecture.course?.id || '',
			}))
			setLectures(transformedLectures)
		} catch (error) {
			console.error('Ошибка при загрузке лекций курса:', error)
		}
	}

	const handleSave = async (formData: any) => {
		try {
			if (selectedCourseId) {
				fetchLecturesByCourse(selectedCourseId)
			} else {
				fetchLectures()
			}
		} catch (error) {
			console.error('Ошибка при обновлении списка лекций:', error)
		}
	}

	const handleEdit = (lecture: Lecture) => {
		setEditingLecture(lecture)
		setShowModal(true)
	}

	const handleDelete = async (lectureId: string) => {
		if (window.confirm('Вы уверены, что хотите удалить эту лекцию?')) {
			try {
				await deleteLecture(lectureId)
				if (selectedCourseId) {
					fetchLecturesByCourse(selectedCourseId)
				} else {
					fetchLectures()
				}
			} catch (error) {
				console.error('Ошибка при удалении лекции:', error)
			}
		}
	}

	const handleAddNew = () => {
		setEditingLecture(null)
		setShowModal(true)
	}

	const handleCloseModal = () => {
		setShowModal(false)
		setEditingLecture(null)
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка лекций...</div>
	}

	return (
		<div className={styles.lectureManagement}>
			<div className={styles.header}>
				<h1>Управление лекциями</h1>
				<button className={styles.addButton} onClick={handleAddNew}>
					+ Добавить лекцию
				</button>
			</div>

			<div className={styles.filters}>
				<select
					value={selectedCourseId}
					onChange={e => setSelectedCourseId(e.target.value)}
					className={styles.courseFilter}
				>
					<option value=''>Все курсы</option>
					{courses.map(course => (
						<option key={course.id} value={course.id}>
							{course.title}
						</option>
					))}
				</select>
			</div>

			<div className={styles.lecturesList}>
				{lectures.length === 0 ? (
					<div className={styles.emptyState}>
						<p>Лекции не найдены</p>
					</div>
				) : (
					lectures.map(lecture => (
						<div key={lecture.id} className={styles.lectureCard}>
							<div className={styles.lectureInfo}>
								<h3>{lecture.title}</h3>
								<p className={styles.courseName}>
									Курс: {lecture.course.title}
								</p>
								<p className={styles.content}>
									{lecture.content.substring(0, 100)}...
								</p>
								{lecture.pdf_file && (
									<p className={styles.pdfInfo}>
										📄 PDF файл: {lecture.pdf_file.split('/').pop()}
									</p>
								)}
							</div>
							<div className={styles.actions}>
								<button
									onClick={() => handleEdit(lecture)}
									className={styles.editButton}
								>
									Редактировать
								</button>
								<button
									onClick={() => handleDelete(lecture.id)}
									className={styles.deleteButton}
								>
									Удалить
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<LectureModal
				isOpen={showModal}
				onClose={handleCloseModal}
				lecture={editingLecture}
				onSave={handleSave}
			/>
		</div>
	)
}

export default LectureManagement
