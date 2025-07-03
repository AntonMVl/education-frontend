import React, { useEffect, useState } from 'react'
import { getLectures } from '../../../utils/lecturesApi'
import {
	createQuestion,
	deleteQuestion,
	getQuestions,
	getQuestionsByLecture,
	updateQuestion,
} from '../../../utils/questionsApi'
import styles from './TestManagement.module.scss'

interface Lecture {
	id: string
	title: string
	course: {
		id: string
		title: string
	}
}

interface Answer {
	id: string
	text: string
	is_correct: boolean
}

interface Question {
	id: string
	text: string
	lecture: Lecture
	answers: Answer[]
}

const TestManagement: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([])
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [loading, setLoading] = useState(true)
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [selectedLectureId, setSelectedLectureId] = useState<string>('')
	const [formData, setFormData] = useState({
		text: '',
		lectureId: '',
		answers: [
			{ text: '', isCorrect: false },
			{ text: '', isCorrect: false },
			{ text: '', isCorrect: false },
			{ text: '', isCorrect: false },
		],
	})

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		if (selectedLectureId) {
			fetchQuestionsByLecture(selectedLectureId)
		} else {
			fetchQuestions()
		}
	}, [selectedLectureId])

	const fetchData = async () => {
		try {
			const [questionsData, lecturesData] = await Promise.all([
				getQuestions(),
				getLectures(),
			])
			setQuestions(questionsData)
			setLectures(lecturesData)
		} catch (error) {
			console.error('Ошибка при загрузке данных:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchQuestions = async () => {
		try {
			const data = await getQuestions()
			setQuestions(data)
		} catch (error) {
			console.error('Ошибка при загрузке вопросов:', error)
		}
	}

	const fetchQuestionsByLecture = async (lectureId: string) => {
		try {
			const data = await getQuestionsByLecture(lectureId)
			setQuestions(data)
		} catch (error) {
			console.error('Ошибка при загрузке вопросов лекции:', error)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Проверяем, что есть хотя бы один правильный ответ
		const correctAnswers = formData.answers.filter(answer => answer.isCorrect)
		if (correctAnswers.length === 0) {
			alert('Должен быть хотя бы один правильный ответ')
			return
		}

		// Проверяем, что все ответы заполнены
		const emptyAnswers = formData.answers.filter(answer => !answer.text.trim())
		if (emptyAnswers.length > 0) {
			alert('Все варианты ответов должны быть заполнены')
			return
		}

		try {
			if (editingQuestion) {
				await updateQuestion(editingQuestion.id, formData)
			} else {
				await createQuestion(formData)
			}
			if (selectedLectureId) {
				fetchQuestionsByLecture(selectedLectureId)
			} else {
				fetchQuestions()
			}
			resetForm()
		} catch (error) {
			console.error('Ошибка при сохранении вопроса:', error)
		}
	}

	const handleEdit = (question: Question) => {
		setEditingQuestion(question)
		setFormData({
			text: question.text,
			lectureId: question.lecture.id,
			answers: question.answers.map(answer => ({
				text: answer.text,
				isCorrect: answer.is_correct,
			})),
		})
		setShowForm(true)
	}

	const handleDelete = async (questionId: string) => {
		if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
			try {
				await deleteQuestion(questionId)
				if (selectedLectureId) {
					fetchQuestionsByLecture(selectedLectureId)
				} else {
					fetchQuestions()
				}
			} catch (error) {
				console.error('Ошибка при удалении вопроса:', error)
			}
		}
	}

	const updateAnswer = (
		index: number,
		field: 'text' | 'isCorrect',
		value: string | boolean
	) => {
		const newAnswers = [...formData.answers]
		newAnswers[index] = { ...newAnswers[index], [field]: value }
		setFormData({ ...formData, answers: newAnswers })
	}

	const resetForm = () => {
		setEditingQuestion(null)
		setFormData({
			text: '',
			lectureId: '',
			answers: [
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
			],
		})
		setShowForm(false)
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка вопросов...</div>
	}

	return (
		<div className={styles.testManagement}>
			<div className={styles.header}>
				<h1>Управление тестами</h1>
				<button className={styles.addButton} onClick={() => setShowForm(true)}>
					+ Добавить вопрос
				</button>
			</div>

			<div className={styles.filters}>
				<select
					value={selectedLectureId}
					onChange={e => setSelectedLectureId(e.target.value)}
					className={styles.lectureFilter}
				>
					<option value=''>Все лекции</option>
					{lectures.map(lecture => (
						<option key={lecture.id} value={lecture.id}>
							{lecture.course.title} - {lecture.title}
						</option>
					))}
				</select>
			</div>

			{showForm && (
				<div className={styles.formOverlay}>
					<div className={styles.form}>
						<h2>
							{editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className={styles.formGroup}>
								<label>Лекция:</label>
								<select
									value={formData.lectureId}
									onChange={e =>
										setFormData({ ...formData, lectureId: e.target.value })
									}
									required
								>
									<option value=''>Выберите лекцию</option>
									{lectures.map(lecture => (
										<option key={lecture.id} value={lecture.id}>
											{lecture.course.title} - {lecture.title}
										</option>
									))}
								</select>
							</div>
							<div className={styles.formGroup}>
								<label>Вопрос:</label>
								<textarea
									value={formData.text}
									onChange={e =>
										setFormData({ ...formData, text: e.target.value })
									}
									required
									rows={3}
								/>
							</div>
							<div className={styles.formGroup}>
								<label>Варианты ответов:</label>
								{formData.answers.map((answer, index) => (
									<div key={index} className={styles.answerRow}>
										<input
											type='text'
											value={answer.text}
											onChange={e =>
												updateAnswer(index, 'text', e.target.value)
											}
											placeholder={`Вариант ${index + 1}`}
											required
										/>
										<label className={styles.correctCheckbox}>
											<input
												type='checkbox'
												checked={answer.isCorrect}
												onChange={e =>
													updateAnswer(index, 'isCorrect', e.target.checked)
												}
											/>
											Правильный
										</label>
									</div>
								))}
							</div>
							<div className={styles.formActions}>
								<button type='submit' className={styles.saveButton}>
									{editingQuestion ? 'Сохранить' : 'Создать'}
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

			<div className={styles.questionsList}>
				{questions.map(question => (
					<div key={question.id} className={styles.questionItem}>
						<div className={styles.questionInfo}>
							<h3>{question.text}</h3>
							<p className={styles.lectureName}>
								{question.lecture.course.title} - {question.lecture.title}
							</p>
							<div className={styles.answersList}>
								{question.answers.map((answer, index) => (
									<div
										key={answer.id}
										className={`${styles.answerItem} ${
											answer.is_correct ? styles.correctAnswer : ''
										}`}
									>
										<span className={styles.answerNumber}>{index + 1}.</span>
										<span className={styles.answerText}>{answer.text}</span>
										{answer.is_correct && (
											<span className={styles.correctMark}>✓</span>
										)}
									</div>
								))}
							</div>
						</div>
						<div className={styles.questionActions}>
							<button
								onClick={() => handleEdit(question)}
								className={styles.editButton}
							>
								Редактировать
							</button>
							<button
								onClick={() => handleDelete(question.id)}
								className={styles.deleteButton}
							>
								Удалить
							</button>
						</div>
					</div>
				))}
			</div>

			{questions.length === 0 && (
				<div className={styles.noQuestions}>
					<p>Вопросы пока не добавлены</p>
				</div>
			)}
		</div>
	)
}

export default TestManagement
