import React, { useState } from 'react'
import { createQuestion } from '../../../utils/questionsApi'
import styles from './BulkQuestionModal.module.scss'

interface Lecture {
	id: string
	title: string
	course?: {
		id: string
		title: string
	}
}

interface BulkQuestion {
	text: string
	answers: Array<{
		text: string
		isCorrect: boolean
	}>
}

interface BulkQuestionModalProps {
	isOpen: boolean
	onClose: () => void
	lectures: Lecture[]
	onSave: () => Promise<void>
}

const BulkQuestionModal: React.FC<BulkQuestionModalProps> = ({
	isOpen,
	onClose,
	lectures,
	onSave,
}) => {
	const [selectedLectureId, setSelectedLectureId] = useState('')
	const [questions, setQuestions] = useState<BulkQuestion[]>([
		{
			text: '',
			answers: [
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
			],
		},
	])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const addQuestion = () => {
		setQuestions([
			...questions,
			{
				text: '',
				answers: [
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
				],
			},
		])
	}

	const removeQuestion = (index: number) => {
		if (questions.length > 1) {
			setQuestions(questions.filter((_, i) => i !== index))
		}
	}

	const updateQuestion = (index: number, field: 'text', value: string) => {
		const newQuestions = [...questions]
		newQuestions[index] = { ...newQuestions[index], [field]: value }
		setQuestions(newQuestions)
	}

	const updateAnswer = (
		questionIndex: number,
		answerIndex: number,
		field: 'text' | 'isCorrect',
		value: string | boolean
	) => {
		const newQuestions = [...questions]
		newQuestions[questionIndex].answers[answerIndex] = {
			...newQuestions[questionIndex].answers[answerIndex],
			[field]: value,
		}
		setQuestions(newQuestions)
	}

	const validateQuestions = (): string | null => {
		if (!selectedLectureId) {
			return 'Выберите лекцию'
		}

		for (let i = 0; i < questions.length; i++) {
			const question = questions[i]
			
			if (!question.text.trim()) {
				return `Вопрос ${i + 1}: текст вопроса обязателен`
			}

			const correctAnswers = question.answers.filter(answer => answer.isCorrect)
			if (correctAnswers.length === 0) {
				return `Вопрос ${i + 1}: должен быть хотя бы один правильный ответ`
			}

			const emptyAnswers = question.answers.filter(answer => !answer.text.trim())
			if (emptyAnswers.length > 0) {
				return `Вопрос ${i + 1}: все варианты ответов должны быть заполнены`
			}
		}

		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const validationError = validateQuestions()
		if (validationError) {
			setError(validationError)
			return
		}

		try {
			setLoading(true)
			setError('')

			// Создаем все вопросы последовательно
			for (const question of questions) {
				await createQuestion({
					text: question.text,
					lectureId: selectedLectureId,
					answers: question.answers,
				})
			}

			await onSave()
			onClose()
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Ошибка при создании вопросов'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const resetForm = () => {
		setSelectedLectureId('')
		setQuestions([
			{
				text: '',
				answers: [
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
					{ text: '', isCorrect: false },
				],
			},
		])
		setError('')
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className={styles.modalOverlay} onClick={handleClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>Массовое добавление вопросов</h2>
					<button className={styles.closeBtn} onClick={handleClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.formGroup}>
						<label>Лекция:</label>
						<select
							value={selectedLectureId}
							onChange={e => setSelectedLectureId(e.target.value)}
							required
						>
							<option value=''>Выберите лекцию</option>
							{lectures.map(lecture => (
								<option key={lecture.id} value={lecture.id}>
									{lecture.course?.title || 'Без курса'} - {lecture.title}
								</option>
							))}
						</select>
					</div>

					<div className={styles.questionsSection}>
						<div className={styles.questionsHeader}>
							<h3>Вопросы ({questions.length})</h3>
							<button
								type='button'
								onClick={addQuestion}
								className={styles.addQuestionBtn}
							>
								+ Добавить вопрос
							</button>
						</div>

						{questions.map((question, questionIndex) => (
							<div key={questionIndex} className={styles.questionBlock}>
								<div className={styles.questionHeader}>
									<h4>Вопрос {questionIndex + 1}</h4>
									{questions.length > 1 && (
										<button
											type='button'
											onClick={() => removeQuestion(questionIndex)}
											className={styles.removeQuestionBtn}
										>
											🗑️ Удалить
										</button>
									)}
								</div>

								<div className={styles.questionContent}>
									<textarea
										value={question.text}
										onChange={e =>
											updateQuestion(questionIndex, 'text', e.target.value)
										}
										placeholder='Введите текст вопроса'
										required
										rows={2}
									/>

									<div className={styles.answersSection}>
										<label>Варианты ответов:</label>
										{question.answers.map((answer, answerIndex) => (
											<div key={answerIndex} className={styles.answerRow}>
												<input
													type='text'
													value={answer.text}
													onChange={e =>
														updateAnswer(
															questionIndex,
															answerIndex,
															'text',
															e.target.value
														)
													}
													placeholder={`Вариант ${answerIndex + 1}`}
													required
												/>
												<label className={styles.correctCheckbox}>
													<input
														type='checkbox'
														checked={answer.isCorrect}
														onChange={e =>
															updateAnswer(
																questionIndex,
																answerIndex,
																'isCorrect',
																e.target.checked
															)
														}
													/>
													Правильный
												</label>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className={styles.formActions}>
						<button
							type='button'
							onClick={handleClose}
							className={styles.cancelButton}
							disabled={loading}
						>
							Отмена
						</button>
						<button type='submit' className={styles.saveButton} disabled={loading}>
							{loading ? 'Создание...' : `Создать ${questions.length} вопросов`}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default BulkQuestionModal 