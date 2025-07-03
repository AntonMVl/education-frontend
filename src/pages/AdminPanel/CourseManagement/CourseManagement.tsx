import React, { useEffect, useState } from 'react'
import {
	createCourse,
	deleteCourse,
	getCourses,
	updateCourse,
	uploadCourseCover,
	removeCourseCover,
	Course,
	CreateCourseData,
} from '../../../utils/coursesApi'
import styles from './CourseManagement.module.scss'

interface Notification {
	id: number
	message: string
	type: 'success' | 'error'
}

interface ConfirmDialog {
	id: number
	message: string
	onConfirm: () => void
	onCancel: () => void
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
		cover_image: null as File | null
	})
	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [coverPreview, setCoverPreview] = useState<string | null>(null)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [confirmDialogs, setConfirmDialogs] = useState<ConfirmDialog[]>([])

	useEffect(() => {
		fetchCourses()
	}, [])

	const addNotification = (message: string, type: 'success' | 'error') => {
		const id = Date.now()
		setNotifications(prev => [...prev, { id, message, type }])
		setTimeout(() => {
			setNotifications(prev => prev.filter(n => n.id !== id))
		}, 4000)
	}

	const showConfirmDialog = (message: string, onConfirm: () => void) => {
		const id = Date.now()
		const dialog: ConfirmDialog = {
			id,
			message,
			onConfirm: () => {
				onConfirm()
				setConfirmDialogs(prev => prev.filter(d => d.id !== id))
			},
			onCancel: () => {
				setConfirmDialogs(prev => prev.filter(d => d.id !== id))
			}
		}
		setConfirmDialogs(prev => [...prev, dialog])
	}

	const fetchCourses = async () => {
		try {
			const data = await getCourses()
			setCourses(data)
		} catch (error) {
			addNotification('Ошибка при загрузке курсов', 'error')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!formData.title.trim()) {
			addNotification('Название курса обязательно', 'error')
			return
		}

		try {
			if (editingCourse) {
				await updateCourse(editingCourse.id, {
					title: formData.title,
					description: formData.description
				})

				if (coverFile) {
					await uploadCourseCover(editingCourse.id, coverFile)
				}

				// Обновляем данные с сервера для получения актуальной обложки
				await fetchCourses()
				addNotification('Курс успешно обновлен', 'success')
			} else {
				const newCourse = await createCourse({
					title: formData.title,
					description: formData.description,
					order_number: formData.order_number
				})

				if (coverFile) {
					await uploadCourseCover(newCourse.id, coverFile)
				}

				// Обновляем данные с сервера для получения актуальной обложки
				await fetchCourses()
				addNotification('Курс успешно создан', 'success')
			}

			handleCloseForm()
		} catch (error) {
			addNotification('Ошибка при сохранении курса', 'error')
		}
	}

	const handleEdit = (course: Course) => {
		setEditingCourse(course)
		setFormData({
			title: course.title,
			description: course.description || '',
			order_number: course.order_number,
			cover_image: null
		})
		setCoverFile(null)
		setCoverPreview(null)
		setShowForm(true)
	}

	const handleDelete = async (courseId: string) => {
		showConfirmDialog('Вы уверены, что хотите удалить этот курс?', async () => {
			try {
				await deleteCourse(courseId)
				
				// Немедленно обновляем состояние, удаляя курс из списка
				setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId))
				
				// Дополнительно обновляем данные с сервера для синхронизации
				await fetchCourses()
				addNotification('Курс успешно удален', 'success')
			} catch (error) {
				addNotification('Ошибка при удалении курса', 'error')
			}
		})
	}

	const resetForm = () => {
		setEditingCourse(null)
		setFormData({ title: '', description: '', order_number: 1, cover_image: null })
		setCoverFile(null)
		setCoverPreview(null)
		setShowForm(false)
	}

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			setCoverFile(file)
			
			// Создаем предварительный просмотр
			const reader = new FileReader()
			reader.onload = (e) => {
				setCoverPreview(e.target?.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleRemoveCover = async () => {
		if (!editingCourse) return
		
		showConfirmDialog('Вы уверены, что хотите удалить обложку курса?', async () => {
			try {
				await removeCourseCover(editingCourse.id)
				// Обновляем данные с сервера
				await fetchCourses()
				// Обновляем состояние формы
				setEditingCourse({ ...editingCourse, cover_image: undefined })
				addNotification('Обложка курса удалена', 'success')
			} catch (error) {
				addNotification('Ошибка при удалении обложки', 'error')
			}
		})
	}

	const handleCloseForm = () => {
		resetForm()
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка курсов...</div>
	}

	return (
		<div className={styles.courseManagement}>
			{notifications.map(notification => (
				<div
					key={notification.id}
					className={`${styles.notification} ${
						notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
					}`}
				>
					{notification.message}
				</div>
			))}

			{confirmDialogs.map(dialog => (
				<div key={dialog.id} className={styles.confirmOverlay}>
					<div className={styles.confirmDialog}>
						<p>{dialog.message}</p>
						<div className={styles.confirmActions}>
							<button 
								className={styles.confirmButton}
								onClick={dialog.onConfirm}
							>
								Подтвердить
							</button>
							<button 
								className={styles.cancelButton}
								onClick={dialog.onCancel}
							>
								Отмена
							</button>
						</div>
					</div>
				</div>
			))}

			<div className={styles.header}>
				<h1>Управление курсами</h1>
				<button className={styles.addButton} onClick={() => setShowForm(true)}>
					+ Добавить курс
				</button>
			</div>

			{showForm && (
				<div className={styles.formOverlay} onClick={handleCloseForm}>
					<div className={styles.form} onClick={e => e.stopPropagation()}>
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
							<div className={styles.formGroup}>
								<label>Обложка курса:</label>
								{editingCourse?.cover_image ? (
									<div className={styles.currentCover}>
										<img 
											src={`http://localhost:3001${editingCourse.cover_image}`} 
											alt="Текущая обложка"
											className={styles.currentCoverImage}
											onError={(e) => {
												// Если изображение не загружается, скрываем контейнер
												e.currentTarget.parentElement!.style.display = 'none';
											}}
										/>
										<span>Текущая обложка</span>
										<button
											type="button"
											onClick={handleRemoveCover}
											className={styles.removeCoverButton}
										>
											Удалить
										</button>
									</div>
								) : (
									<div className={styles.noCurrentCover}>
										<span>У курса нет обложки</span>
									</div>
								)}
								<input
									type='file'
									accept='image/*'
									onChange={handleCoverChange}
								/>
								{coverFile && (
									<div className={styles.newCoverPreview}>
										{coverPreview && (
											<img 
												src={coverPreview} 
												alt="Предварительный просмотр"
												className={styles.coverPreviewImage}
											/>
										)}
										<span>Новая обложка: {coverFile.name}</span>
									</div>
								)}
							</div>
							<div className={styles.formActions}>
								<button type='submit' className={styles.saveButton}>
									{editingCourse ? 'Сохранить' : 'Создать'}
								</button>
								<button
									type='button'
									onClick={handleCloseForm}
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
							{course.cover_image ? (
								<div className={styles.courseCover}>
									<img 
										src={`http://localhost:3001${course.cover_image}`} 
										alt={course.title}
										className={styles.coverImage}
										onError={(e) => {
											// Если изображение не загружается, скрываем контейнер
											e.currentTarget.parentElement!.style.display = 'none';
										}}
									/>
								</div>
							) : (
								<div className={styles.noCover}>
									<span>Нет обложки</span>
								</div>
							)}
							<div className={styles.courseDetails}>
								<h3>{course.title}</h3>
								{course.description && <p>{course.description}</p>}
								<span className={styles.orderNumber}>
									Порядок: {course.order_number}
								</span>
								<span className={styles.lecturesCount}>
									Лекций: {course.lecturesCount || course.lectures?.length || 0}
								</span>
							</div>
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
