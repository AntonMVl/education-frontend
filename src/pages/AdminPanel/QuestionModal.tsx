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

	const addAnswer = () => {
		setFormData(prev => ({
			...prev,
			answers: [...prev.answers, { text: '', isCorrect: false }],
		}))
	}

	const removeAnswer = (index: number) => {
		setFormData(prev => ({
			...prev,
			answers: prev.answers.filter((_, i) => i !== index),
		}))
	}

	const updateAnswer = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
		setFormData(prev => ({
			...prev,
			answers: prev.answers.map((answer, i) =>
				i === index ? { ...answer, [field]: value } : answer
			),
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

		if (formData.answers.length < 2) {
			setError('Добавьте минимум 2 варианта ответа')
			return
		}

		if (formData.answers.some(answer => !answer.text.trim())) {
			setError('Все варианты ответов должны быть заполнены')
			return
		}

		if (!formData.answers.some(answer => answer.isCorrect)) {
			setError('Выберите хотя бы один правильный ответ')
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

					<div className={styles.formGroup}>
						<label>Варианты ответов *</label>
						<div className={styles.answersContainer}>
							{formData.answers.map((answer, index) => (
								<div key={index} className={styles.answerItem}>
									<input
										type='text'
										value={answer.text}
										onChange={e => updateAnswer(index, 'text', e.target.value)}
										placeholder={`Вариант ответа ${index + 1}`}
										className={styles.answerInput}
									/>
									<label className={styles.correctLabel}>
										<input
											type='checkbox'
											checked={answer.isCorrect}
											onChange={e => updateAnswer(index, 'isCorrect', e.target.checked)}
										/>
										Правильный
									</label>
									<button
										type='button'
										onClick={() => removeAnswer(index)}
										className={styles.removeAnswerBtn}
									>
										×
									</button>
								</div>
							))}
							<button
								type='button'
								onClick={addAnswer}
								className={styles.addAnswerBtn}
							>
								+ Добавить вариант ответа
							</button>
						</div>
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
