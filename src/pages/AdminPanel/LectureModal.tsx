import React, { useEffect, useState } from 'react'
import {
	CreateLectureData,
	Lecture,
	UpdateLectureData,
} from '../../utils/lecturesApi'
import styles from './LectureModal.module.scss'

interface LectureModalProps {
	isOpen: boolean
	onClose: () => void
	lecture?: Lecture | null
	onSave: (data: CreateLectureData | UpdateLectureData) => Promise<void>
}

const LectureModal: React.FC<LectureModalProps> = ({
	isOpen,
	onClose,
	lecture,
	onSave,
}) => {
	const [formData, setFormData] = useState<CreateLectureData>({
		title: '',
		description: '',
		content: '',
		order: 1,
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (lecture) {
			setFormData({
				title: lecture.title,
				description: lecture.description,
				content: lecture.content,
				order: lecture.order,
			})
		} else {
			setFormData({
				title: '',
				description: '',
				content: '',
				order: 1,
			})
		}
		setError('')
	}, [lecture, isOpen])

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: name === 'order' ? parseInt(value) || 1 : value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title.trim()) {
			setError('Название лекции обязательно')
			return
		}

		if (!formData.description.trim()) {
			setError('Описание лекции обязательно')
			return
		}

		if (!formData.content.trim()) {
			setError('Содержание лекции обязательно')
			return
		}

		try {
			setLoading(true)
			setError('')
			await onSave(formData)
			onClose()
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Ошибка сохранения лекции'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>{lecture ? 'Редактировать лекцию' : 'Создать лекцию'}</h2>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.formGroup}>
						<label htmlFor='title'>Название лекции *</label>
						<input
							type='text'
							id='title'
							name='title'
							value={formData.title}
							onChange={handleInputChange}
							placeholder='Введите название лекции'
							required
							autoComplete='off'
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='description'>Описание *</label>
						<textarea
							id='description'
							name='description'
							value={formData.description}
							onChange={handleInputChange}
							placeholder='Введите краткое описание лекции'
							rows={3}
							required
							autoComplete='off'
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='content'>Содержание лекции *</label>
						<textarea
							id='content'
							name='content'
							value={formData.content}
							onChange={handleInputChange}
							placeholder='Введите содержание лекции'
							rows={10}
							required
							autoComplete='off'
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='order'>Порядковый номер</label>
						<input
							type='number'
							id='order'
							name='order'
							value={formData.order}
							onChange={handleInputChange}
							min='1'
							placeholder='1'
						/>
					</div>

					<div className={styles.formActions}>
						<button
							type='button'
							className={styles.cancelBtn}
							onClick={onClose}
							disabled={loading}
						>
							Отмена
						</button>
						<button type='submit' className={styles.saveBtn} disabled={loading}>
							{loading ? 'Сохранение...' : lecture ? 'Обновить' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default LectureModal
