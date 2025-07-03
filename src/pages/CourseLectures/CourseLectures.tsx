import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { RootState } from '../../store/store'
import { getCourseLectures, getCourseProgress } from '../../utils/coursesApi'
import styles from './CourseLectures.module.scss'

interface Lecture {
	id: string
	title: string
	content: string
	pdf_file?: string
	has_test: boolean
	completed?: boolean
}

interface CourseProgress {
	course: any
	progress: number
	completedLectures: number
	totalLectures: number
	completed: boolean
}

const CourseLectures: React.FC = () => {
	const { courseId } = useParams<{ courseId: string }>()
	const navigate = useNavigate()
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [progress, setProgress] = useState<CourseProgress | null>(null)
	const [loading, setLoading] = useState(true)
	const user = useSelector((state: RootState) => state.user.user)

	useEffect(() => {
		const fetchData = async () => {
			if (!courseId) return

			try {
				const progressData = await getCourseProgress(courseId)
				setProgress(progressData)
				// Лекции теперь приходят вместе с прогрессом курса
				setLectures(progressData.course.lectures || [])
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [courseId])

	const handleLectureClick = (lecture: Lecture) => {
		navigate(`/lecture/${lecture.id}`)
	}

	const handleBackToCourses = () => {
		navigate('/courses')
	}

	if (loading) {
		return (
			<div className={styles.loading}>
				<p>Загрузка лекций...</p>
			</div>
		)
	}

	if (!progress) {
		return (
			<div className={styles.error}>
				<p>Курс не найден</p>
				<button onClick={handleBackToCourses}>Вернуться к курсам</button>
			</div>
		)
	}

	return (
		<section className={styles.courseLectures}>
			<div className={styles.container}>
				<div className={styles.header}>
					<button onClick={handleBackToCourses} className={styles.backButton}>
						← Назад к курсам
					</button>
					<h1 className={styles.title}>{progress.course.title}</h1>
				</div>

				<div className={styles.progressSection}>
					<div className={styles.progressInfo}>
						<span className={styles.progressText}>
							Прогресс: {Math.round(progress.progress)}%
						</span>
						<span className={styles.lecturesInfo}>
							{progress.completedLectures} из {progress.totalLectures} лекций
							завершено
						</span>
					</div>
					<div className={styles.progressBar}>
						<div
							className={styles.progressFill}
							style={{ width: `${progress.progress}%` }}
						></div>
					</div>
				</div>

				<div className={styles.lecturesList}>
					{lectures.map((lecture, index) => (
						<div
							key={lecture.id}
							className={`${styles.lectureCard} ${
								lecture.completed ? styles.completed : styles.incomplete
							}`}
							onClick={() => handleLectureClick(lecture)}
						>
							<div className={styles.lectureNumber}>{index + 1}</div>
							<div className={styles.lectureInfo}>
								<h3 className={styles.lectureTitle}>{lecture.title}</h3>
								<div className={styles.lectureMeta}>
									{lecture.has_test && (
										<span className={styles.testBadge}>📝 Тест</span>
									)}
									{lecture.pdf_file && (
										<span className={styles.pdfBadge}>📄 PDF</span>
									)}
								</div>
							</div>
							<div className={styles.lectureStatus}>
								{lecture.completed ? (
									<span className={styles.completedIcon}>✅</span>
								) : (
									<span className={styles.incompleteIcon}>⏳</span>
								)}
							</div>
						</div>
					))}
				</div>

				{lectures.length === 0 && (
					<div className={styles.noLectures}>
						<p>Лекции пока не добавлены к этому курсу</p>
					</div>
				)}
			</div>
		</section>
	)
}

export default CourseLectures
