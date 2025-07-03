import React, { useEffect, useState } from 'react'
import { Lecture, getLectures } from '../../utils/lecturesApi'
import { Question } from '../../utils/questionsApi'
import styles from './QuestionModal.module.scss'

// Типы для создания и обновления вопросов
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

interface CreateAnswerData {
	text: string
	isCorrect: boolean
}

interface QuestionModalProps {
	isOpen: boolean
	onClose: () => void
	question?: Question | null
	onSave: (data: CreateQuestionData | UpdateQuestionData) => Promise<void>
}

const QuestionModal: React.FC<QuestionModalProps> = ({
	isOpen,
	onClose,
	question,
	onSave,
}) => {
	const [formData, setFormData] = useState<CreateQuestionData>({
		text: '',
		lectureId: '1',
		answers: [],
	})
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (isOpen) {
			fetchLectures()
		}
	}, [isOpen])

	useEffect(() => {
		if (question) {
			setFormData({
				text: question.text,
				lectureId: question.lectureId,
				answers: question.answers.map(answer => ({
					text: answer.text,
					isCorrect: answer.isCorrect,
				})),
			})
		} else {
			setFormData({
				text: '',
				lectureId: lectures.length > 0 ? lectures[0].id : '1',
				answers: [],
			})
		}
		setError('')
	}, [question, lectures])

	const fetchLectures = async () => {
		try {
			const data = await getLectures()
			setLectures(data)
		} catch {
			setError('Ошибка загрузки списка лекций')
		}
	}

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: name === 'lectureId' ? value : value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.text.trim()) {
			setError('Текст вопроса обязателен')
			return
		}

		if (!formData.lectureId) {
			setError('Выберите лекцию')
			return
		}

		try {
			setLoading(true)
			setError('')
			await onSave(formData)
			onClose()
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Ошибка сохранения вопроса'
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
					<h2>{question ? 'Редактировать вопрос' : 'Создать вопрос'}</h2>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.formGroup}>
						<label htmlFor='lectureId'>Лекция *</label>
						<select
							id='lectureId'
							name='lectureId'
							value={formData.lectureId}
							onChange={handleInputChange}
							required
						>
							{lectures.map(lecture => (
								<option key={lecture.id} value={lecture.id}>
									{lecture.title}
								</option>
							))}
						</select>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='text'>Текст вопроса *</label>
						<textarea
							id='text'
							name='text'
							value={formData.text}
							onChange={handleInputChange}
							placeholder='Введите текст вопроса'
							rows={4}
							required
							autoComplete='off'
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
							{loading ? 'Сохранение...' : question ? 'Обновить' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default QuestionModal
