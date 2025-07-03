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
	const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
	const [pdfLoading, setPdfLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			if (!lectureId) return

			try {
				// Проверяем доступность лекции
				const availability = await checkLectureAvailability(lectureId)
				if (!availability.isAvailable) {
					setError(availability.message || 'Эта лекция пока недоступна. Сначала завершите предыдущие лекции.')
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

	// Обработчик клавиши Escape для выхода из полноэкранного режима
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isPdfFullscreen) {
				setIsPdfFullscreen(false)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isPdfFullscreen])

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
			const fullUrl = `http://localhost:3001${lecture.pdf_file}`
			window.open(fullUrl, '_blank')
		}
	}

	const handlePdfLoad = () => {
		setPdfLoading(false)
	}

	const togglePdfFullscreen = () => {
		setIsPdfFullscreen(!isPdfFullscreen)
	}

	const handlePdfError = () => {
		setPdfLoading(false)
		setError('Ошибка при загрузке PDF файла')
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
						{lecture.pdf_file ? (
							<div className={styles.pdfSection}>
								<div className={styles.pdfHeader}>
									<h3>📄 Материалы лекции</h3>
									<div className={styles.pdfControls}>
										<button
											onClick={togglePdfFullscreen}
											className={styles.fullscreenBtn}
											title={isPdfFullscreen ? "Выйти из полноэкранного режима (Esc)" : "Полноэкранный режим"}
										>
											{isPdfFullscreen ? "⤓" : "⤢"}
										</button>
										<button
											onClick={handleDownloadPDF}
											className={styles.downloadBtn}
											title="Скачать PDF"
										>
											📥 Скачать
										</button>
									</div>
								</div>
								
								<div className={`${styles.pdfContainer} ${isPdfFullscreen ? styles.fullscreen : ''}`}>
									{pdfLoading && (
										<div className={styles.pdfLoading}>
											<div className={styles.spinner}></div>
											<p>Загрузка материалов лекции...</p>
										</div>
									)}
									<iframe
										src={`http://localhost:3001${lecture.pdf_file}`}
										title="PDF лекции"
										className={styles.pdfViewer}
										onLoad={handlePdfLoad}
										onError={handlePdfError}
										style={{ display: pdfLoading ? 'none' : 'block' }}
									/>
								</div>
							</div>
						) : (
							<div className={styles.noPdfSection}>
								<div className={styles.noPdfContent}>
									<h3>📄 Материалы лекции</h3>
									<p>Для этой лекции материалы пока не загружены.</p>
								</div>
							</div>
						)}

						<div className={styles.actions}>
							<button
								onClick={handleStartTest}
								className={styles.startTestBtn}
							>
								{lecture.has_test ? 'Начать тест' : 'Завершить лекцию'}
							</button>
						</div>
					</div>
				)}

				{currentStep === 'test' && (
					<div className={styles.testSection}>
						<h2>Тест по лекции</h2>
						<p>Ответьте на все вопросы. Для прохождения теста необходимо ответить правильно на все вопросы.</p>

						<div className={styles.questions}>
							{questions.map((question, index) => (
								<div key={question.id} className={styles.question}>
									<h3>Вопрос {index + 1}</h3>
									<p>{question.text}</p>
									<div className={styles.answers}>
										{question.answers.map((answer) => (
											<label key={answer.id} className={styles.answer}>
												<input
													type="radio"
													name={question.id}
													value={answer.id}
													checked={selectedAnswers[question.id] === answer.id}
													onChange={() => handleAnswerSelect(question.id, answer.id)}
												/>
												<span>{answer.text}</span>
											</label>
										))}
									</div>
								</div>
							))}
						</div>

						<div className={styles.testActions}>
							<button
								onClick={handleSubmitTest}
								className={styles.submitTestBtn}
								disabled={Object.keys(selectedAnswers).length < questions.length}
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
							<div className={styles.success}>
								<p>🎉 Поздравляем! Вы успешно прошли тест!</p>
								<p>Результат: {testResult.score}%</p>
								<button
									onClick={handleCompleteLecture}
									className={styles.completeBtn}
								>
									Завершить лекцию
								</button>
							</div>
						) : (
							<div className={styles.failure}>
								<p>❌ К сожалению, вы не прошли тест.</p>
								<p>Результат: {testResult.score}%</p>
								<p>Для прохождения необходимо ответить правильно на все вопросы.</p>
								<button
									onClick={handleRetryTest}
									className={styles.retryBtn}
								>
									Попробовать снова
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	)
}

export default LectureStudy
