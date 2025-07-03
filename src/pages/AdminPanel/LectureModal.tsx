import React, { useEffect, useState } from 'react'
import {
	CreateLectureData,
	Lecture,
	UpdateLectureData,
	createLecture,
	updateLecture,
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
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		courseId: '',
		pdf_file: '',
		has_test: false,
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	useEffect(() => {
		if (lecture) {
			setFormData({
				title: lecture.title,
				content: lecture.content || '',
				courseId: lecture.courseId,
				pdf_file: lecture.pdf_file || '',
				has_test: lecture.has_test,
			})
		} else {
			setFormData({
				title: '',
				content: '',
				courseId: '',
				pdf_file: '',
				has_test: false,
			})
		}
		setError('')
		setSelectedFile(null)
	}, [lecture, isOpen])

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
		}))
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			if (file.type === 'application/pdf') {
				setSelectedFile(file)
				setError('')
			} else {
				setError('Пожалуйста, выберите PDF файл')
				setSelectedFile(null)
			}
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title.trim()) {
			setError('Название лекции обязательно')
			return
		}

		if (!formData.courseId) {
			setError('Выберите курс для лекции')
			return
		}

		// Проверяем, что есть либо выбранный файл, либо существующий PDF
		if (!selectedFile && !lecture?.pdf_file) {
			setError('PDF файл лекции обязателен')
			return
		}

		try {
			setLoading(true)
			setError('')
			
			if (lecture) {
				// Обновление существующей лекции
				await updateLecture(lecture.id, formData, selectedFile || undefined)
			} else {
				// Создание новой лекции
				await createLecture(formData, selectedFile || undefined)
			}
			
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
						<label htmlFor='courseId'>Курс *</label>
						<select
							id='courseId'
							name='courseId'
							value={formData.courseId}
							onChange={handleInputChange}
							required
						>
							<option value=''>Выберите курс</option>
							<option value='1'>Дактилоскопия</option>
							<option value='2'>Трасология</option>
						</select>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='pdf_file'>PDF файл лекции *</label>
						<input
							type='file'
							id='pdf_file'
							name='pdf_file'
							accept='.pdf'
							onChange={handleFileChange}
							required={!lecture?.pdf_file}
						/>
						{selectedFile && (
							<p className={styles.fileInfo}>Выбран файл: {selectedFile.name}</p>
						)}
						{lecture?.pdf_file && !selectedFile && (
							<p className={styles.fileInfo}>
								Текущий файл: {lecture.pdf_file.split('/').pop()}
							</p>
						)}
						<p className={styles.fileHint}>
							📄 PDF файл является основным содержанием лекции
						</p>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='has_test' className={styles.checkboxLabel}>
							<input
								type='checkbox'
								id='has_test'
								name='has_test'
								checked={formData.has_test}
								onChange={handleInputChange}
							/>
							Лекция предусматривает прохождение тестирования
						</label>
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
