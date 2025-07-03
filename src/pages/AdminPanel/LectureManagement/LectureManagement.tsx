import React, { useEffect, useState } from 'react'
import { getCourses } from '../../../utils/coursesApi'
import {
	createLecture,
	deleteLecture,
	getLectures,
	getLecturesByCourse,
	updateLecture,
} from '../../../utils/lecturesApi'
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
	pdf_file?: string
	images: any[]
}

const LectureManagement: React.FC = () => {
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)
	const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [selectedCourseId, setSelectedCourseId] = useState<string>('')
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		courseId: '',
	})

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
			setLectures(lecturesData)
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
			setLectures(data)
		} catch (error) {
			console.error('Ошибка при загрузке лекций:', error)
		}
	}

	const fetchLecturesByCourse = async (courseId: string) => {
		try {
			const data = await getLecturesByCourse(courseId)
			setLectures(data)
		} catch (error) {
			console.error('Ошибка при загрузке лекций курса:', error)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			if (editingLecture) {
				await updateLecture(editingLecture.id, formData)
			} else {
				await createLecture(formData)
			}
			if (selectedCourseId) {
				fetchLecturesByCourse(selectedCourseId)
			} else {
				fetchLectures()
			}
			resetForm()
		} catch (error) {
			console.error('Ошибка при сохранении лекции:', error)
		}
	}

	const handleEdit = (lecture: Lecture) => {
		setEditingLecture(lecture)
		setFormData({
			title: lecture.title,
			content: lecture.content,
			courseId: lecture.course.id,
		})
		setShowForm(true)
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

	const resetForm = () => {
		setEditingLecture(null)
		setFormData({ title: '', content: '', courseId: '' })
		setShowForm(false)
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка лекций...</div>
	}

	return (
		<div className={styles.lectureManagement}>
			<div className={styles.header}>
				<h1>Управление лекциями</h1>
				<button className={styles.addButton} onClick={() => setShowForm(true)}>
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

			{showForm && (
				<div className={styles.formOverlay}>
					<div className={styles.form}>
						<h2>
							{editingLecture ? 'Редактировать лекцию' : 'Добавить лекцию'}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className={styles.formGroup}>
								<label>Название лекции:</label>
								<input
									type='text'
									value={formData.title}
									onChange={e =>
										setFormData({ ...formData, title: e.target.value })
									}
									required
								/>
							</div>
							<div className={styles.formGroup}>
								<label>Курс:</label>
								<select
									value={formData.courseId}
									onChange={e =>
										setFormData({ ...formData, courseId: e.target.value })
									}
									required
								>
									<option value=''>Выберите курс</option>
									{courses.map(course => (
										<option key={course.id} value={course.id}>
											{course.title}
										</option>
									))}
								</select>
							</div>
							<div className={styles.formGroup}>
								<label>Содержание:</label>
								<textarea
									value={formData.content}
									onChange={e =>
										setFormData({ ...formData, content: e.target.value })
									}
									required
									rows={10}
								/>
							</div>
							<div className={styles.formActions}>
								<button type='submit' className={styles.saveButton}>
									{editingLecture ? 'Сохранить' : 'Создать'}
								</button>
								<button
									type='button'
									onClick={resetForm}
									className={styles.cancelButton}
								>
									Отмена
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<div className={styles.lecturesList}>
				{lectures.map(lecture => (
					<div key={lecture.id} className={styles.lectureItem}>
						<div className={styles.lectureInfo}>
							<h3>{lecture.title}</h3>
							<p className={styles.courseName}>Курс: {lecture.course.title}</p>
							<p className={styles.contentPreview}>
								{lecture.content.substring(0, 150)}...
							</p>
							{lecture.pdf_file && (
								<span className={styles.hasPdf}>📄 PDF прикреплен</span>
							)}
							{lecture.images && lecture.images.length > 0 && (
								<span className={styles.hasImages}>
									🖼️ {lecture.images.length} изображений
								</span>
							)}
						</div>
						<div className={styles.lectureActions}>
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
				))}
			</div>

			{lectures.length === 0 && (
				<div className={styles.noLectures}>
					<p>Лекции пока не добавлены</p>
				</div>
			)}
		</div>
	)
}

export default LectureManagement
