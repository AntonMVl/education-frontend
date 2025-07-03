import React, { useEffect, useState } from 'react'
import {
	createCourse,
	deleteCourse,
	getCourses,
	updateCourse,
} from '../../../utils/coursesApi'
import styles from './CourseManagement.module.scss'

interface Course {
	id: string
	title: string
	description?: string
	order_number: number
	images: any[]
}

const CourseManagement: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)
	const [editingCourse, setEditingCourse] = useState<Course | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		order_number: 1,
	})

	useEffect(() => {
		fetchCourses()
	}, [])

	const fetchCourses = async () => {
		try {
			const data = await getCourses()
			setCourses(data)
		} catch (error) {
			console.error('Ошибка при загрузке курсов:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			if (editingCourse) {
				await updateCourse(editingCourse.id, formData)
			} else {
				await createCourse(formData)
			}
			fetchCourses()
			resetForm()
		} catch (error) {
			console.error('Ошибка при сохранении курса:', error)
		}
	}

	const handleEdit = (course: Course) => {
		setEditingCourse(course)
		setFormData({
			title: course.title,
			description: course.description || '',
			order_number: course.order_number,
		})
		setShowForm(true)
	}

	const handleDelete = async (courseId: string) => {
		if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
			try {
				await deleteCourse(courseId)
				fetchCourses()
			} catch (error) {
				console.error('Ошибка при удалении курса:', error)
			}
		}
	}

	const resetForm = () => {
		setEditingCourse(null)
		setFormData({ title: '', description: '', order_number: 1 })
		setShowForm(false)
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка курсов...</div>
	}

	return (
		<div className={styles.courseManagement}>
			<div className={styles.header}>
				<h1>Управление курсами</h1>
				<button className={styles.addButton} onClick={() => setShowForm(true)}>
					+ Добавить курс
				</button>
			</div>

			{showForm && (
				<div className={styles.formOverlay}>
					<div className={styles.form}>
						<h2>{editingCourse ? 'Редактировать курс' : 'Добавить курс'}</h2>
						<form onSubmit={handleSubmit}>
							<div className={styles.formGroup}>
								<label>Название курса:</label>
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
								<label>Описание:</label>
								<textarea
									value={formData.description}
									onChange={e =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>
							<div className={styles.formGroup}>
								<label>Порядковый номер:</label>
								<input
									type='number'
									value={formData.order_number}
									onChange={e =>
										setFormData({
											...formData,
											order_number: parseInt(e.target.value),
										})
									}
									min='1'
									required
								/>
							</div>
							<div className={styles.formActions}>
								<button type='submit' className={styles.saveButton}>
									{editingCourse ? 'Сохранить' : 'Создать'}
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

			<div className={styles.coursesList}>
				{courses.map(course => (
					<div key={course.id} className={styles.courseItem}>
						<div className={styles.courseInfo}>
							<h3>{course.title}</h3>
							{course.description && <p>{course.description}</p>}
							<span className={styles.orderNumber}>
								Порядок: {course.order_number}
							</span>
						</div>
						<div className={styles.courseActions}>
							<button
								onClick={() => handleEdit(course)}
								className={styles.editButton}
							>
								Редактировать
							</button>
							<button
								onClick={() => handleDelete(course.id)}
								className={styles.deleteButton}
							>
								Удалить
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default CourseManagement
