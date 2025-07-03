import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
	checkLectureAvailability,
	checkTestAnswers,
	completeLecture,
	getLecture,
	getRandomQuestions,
} from '../../utils/coursesApi'
import styles from './LectureStudy.module.scss'

interface Question {
	id: string
	text: string
	answers: Answer[]
}

interface Answer {
	id: string
	text: string
	is_correct: boolean
}

interface Lecture {
	id: string
	title: string
	content: string
	pdf_file?: string
	has_test: boolean
	course: {
		id: string
		title: string
	}
}

const LectureStudy: React.FC = () => {
	const { lectureId } = useParams<{ lectureId: string }>()
	const navigate = useNavigate()
	const [lecture, setLecture] = useState<Lecture | null>(null)
	const [questions, setQuestions] = useState<Question[]>([])
	const [currentStep, setCurrentStep] = useState<'study' | 'test' | 'result'>(
		'study'
	)
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<string, string>
	>({})
	const [testResult, setTestResult] = useState<{
		passed: boolean
		score: number
	} | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isAvailable, setIsAvailable] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			if (!lectureId) return

			try {
				// Проверяем доступность лекции
				const availability = await checkLectureAvailability(lectureId)
				if (!availability.isAvailable) {
					setError(
						'Эта лекция пока недоступна. Сначала завершите предыдущие лекции.'
					)
					setLoading(false)
					return
				}
				setIsAvailable(true)

				// Загружаем лекцию
				const lectureData = await getLecture(lectureId)
				setLecture(lectureData)

				// Если есть тест, загружаем вопросы
				if (lectureData.has_test) {
					const questionsData = await getRandomQuestions(lectureId)
					setQuestions(questionsData)
				}
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)
				setError('Ошибка при загрузке лекции')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [lectureId])

	const handleStartTest = () => {
		if (lecture?.has_test) {
			setCurrentStep('test')
		} else {
			handleCompleteLecture()
		}
	}

	const handleAnswerSelect = (questionId: string, answerId: string) => {
		setSelectedAnswers(prev => ({
			...prev,
			[questionId]: answerId,
		}))
	}

	const handleSubmitTest = async () => {
		if (!lectureId) return

		const answers = Object.entries(selectedAnswers).map(
			([questionId, answerId]) => ({
				questionId,
				answerId,
			})
		)

		try {
			const result = await checkTestAnswers(lectureId, answers)
			setTestResult(result)
			setCurrentStep('result')
		} catch (error) {
			console.error('Ошибка при проверке теста:', error)
			setError('Ошибка при проверке теста')
		}
	}

	const handleCompleteLecture = async () => {
		if (!lectureId) return

		try {
			await completeLecture(lectureId)
			// Переходим к следующей лекции или курсу
			navigate(`/course/${lecture?.course.id}/lectures`)
		} catch (error) {
			console.error('Ошибка при завершении лекции:', error)
			setError('Ошибка при завершении лекции')
		}
	}

	const handleRetryTest = () => {
		setSelectedAnswers({})
		setTestResult(null)
		setCurrentStep('test')
	}

	const handleBackToCourse = () => {
		navigate(`/course/${lecture?.course.id}/lectures`)
	}

	const handleDownloadPDF = () => {
		if (lecture?.pdf_file) {
			window.open(lecture.pdf_file, '_blank')
		}
	}

	if (loading) {
		return (
			<div className={styles.loading}>
				<p>Загрузка лекции...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className={styles.error}>
				<p>{error}</p>
				<button onClick={handleBackToCourse}>Вернуться к курсу</button>
			</div>
		)
	}

	if (!lecture) {
		return (
			<div className={styles.error}>
				<p>Лекция не найдена</p>
				<button onClick={handleBackToCourse}>Вернуться к курсу</button>
			</div>
		)
	}

	return (
		<section className={styles.lectureStudy}>
			<div className={styles.container}>
				<div className={styles.header}>
					<button onClick={handleBackToCourse} className={styles.backButton}>
						← Назад к курсу
					</button>
					<h1 className={styles.title}>{lecture.title}</h1>
				</div>

				{currentStep === 'study' && (
					<div className={styles.studySection}>
						<div className={styles.content}>
							<div className={styles.textContent}>
								<h2>Содержание лекции</h2>
								<div dangerouslySetInnerHTML={{ __html: lecture.content }} />
							</div>

							{lecture.pdf_file && (
								<div className={styles.pdfSection}>
									<h3>Дополнительные материалы</h3>
									<button
										onClick={handleDownloadPDF}
										className={styles.downloadButton}
									>
										📄 Скачать PDF лекции
									</button>
								</div>
							)}
						</div>

						<div className={styles.actions}>
							<button
								onClick={handleStartTest}
								className={styles.continueButton}
							>
								{lecture.has_test ? 'Начать тест' : 'Продолжить обучение'}
							</button>
						</div>
					</div>
				)}

				{currentStep === 'test' && (
					<div className={styles.testSection}>
						<h2>Тест по лекции</h2>
						<p className={styles.testInfo}>
							Ответьте на все вопросы. Для прохождения теста все ответы должны
							быть правильными.
						</p>

						<div className={styles.questions}>
							{questions.map((question, index) => (
								<div key={question.id} className={styles.questionCard}>
									<h3 className={styles.questionTitle}>
										Вопрос {index + 1}: {question.text}
									</h3>
									<div className={styles.answers}>
										{question.answers.map(answer => (
											<label key={answer.id} className={styles.answerOption}>
												<input
													type='radio'
													name={question.id}
													value={answer.id}
													checked={selectedAnswers[question.id] === answer.id}
													onChange={() =>
														handleAnswerSelect(question.id, answer.id)
													}
												/>
												<span className={styles.answerText}>{answer.text}</span>
											</label>
										))}
									</div>
								</div>
							))}
						</div>

						<div className={styles.testActions}>
							<button
								onClick={handleSubmitTest}
								disabled={
									Object.keys(selectedAnswers).length < questions.length
								}
								className={styles.submitButton}
							>
								Завершить тест
							</button>
						</div>
					</div>
				)}

				{currentStep === 'result' && testResult && (
					<div className={styles.resultSection}>
						<h2>Результаты теста</h2>

						{testResult.passed ? (
							<div className={styles.successResult}>
								<div className={styles.successIcon}>✅</div>
								<h3>Поздравляем! Тест пройден успешно!</h3>
								<p>Вы правильно ответили на все вопросы.</p>
								<button
									onClick={handleCompleteLecture}
									className={styles.continueButton}
								>
									Продолжить обучение
								</button>
							</div>
						) : (
							<div className={styles.failedResult}>
								<div className={styles.failedIcon}>❌</div>
								<h3>Тест не пройден</h3>
								<p>
									Вы допустили ошибки. Рекомендуется повторить изучение лекции и
									пройти тест заново.
								</p>
								<div className={styles.retryActions}>
									<button
										onClick={() => setCurrentStep('study')}
										className={styles.retryButton}
									>
										Повторить изучение
									</button>
									<button
										onClick={handleRetryTest}
										className={styles.retryButton}
									>
										Пройти тест заново
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	)
}

export default LectureStudy
