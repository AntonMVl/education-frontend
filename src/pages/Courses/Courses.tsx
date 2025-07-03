import React, { useEffect, useState } from 'react'
import { getAvailableCourses } from '../../utils/coursesApi'
import styles from './Courses.module.scss'

interface CourseImage {
	file_path: string
}

interface CourseLecture {
	id: string
	title: string
}

interface Course {
	id: string
	title: string
	description?: string
	order_number: number
	cover_image?: string
	images: CourseImage[]
	lectures: CourseLecture[]
	lecturesCount?: number
	isAvailable: boolean
	progress: number
	completed: boolean
}

const Courses: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const data = await getAvailableCourses()
				setCourses(data)
			} catch (error) {
				console.error('Ошибка при загрузке курсов:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchCourses()
	}, [])

	const handleCourseClick = (course: Course) => {
		if (course.isAvailable) {
			// Переход к лекциям курса
			window.location.href = `/course/${course.id}/lectures`
		}
	}

	if (loading) {
		return (
			<div className={styles.loading}>
				<p>Загрузка курсов...</p>
			</div>
		)
	}

	return (
		<section className={styles.courses}>
			<div className={styles.container}>
				<h1 className={styles.title}>Доступные курсы</h1>

				<div className={styles.coursesGrid}>
					{courses.map(course => (
						<div
							key={course.id}
							className={`${styles.courseCard} ${
								course.isAvailable ? styles.available : styles.unavailable
							}`}
							onClick={() => handleCourseClick(course)}
						>
							<div className={styles.courseImage}>
								{course.cover_image ? (
									<img 
										src={`http://localhost:3001${course.cover_image}`} 
										alt={course.title} 
									/>
								) : course.images && course.images.length > 0 ? (
									<img src={course.images[0].file_path} alt={course.title} />
								) : (
									<div className={styles.placeholderImage}>
										<span>📚</span>
									</div>
								)}
							</div>

							<div className={styles.courseInfo}>
								<h3 className={styles.courseTitle}>{course.title}</h3>
								{course.description && (
									<p className={styles.courseDescription}>
										{course.description}
									</p>
								)}
								<p className={styles.lecturesCount}>
									Лекций: {course.lectures.length}
								</p>

								{course.isAvailable && (
									<div className={styles.progressSection}>
										<div className={styles.progressBar}>
											<div
												className={styles.progressFill}
												style={{ width: `${course.progress}%` }}
											></div>
										</div>
										<span className={styles.progressText}>
											{Math.round(course.progress)}%
										</span>
									</div>
								)}

								{!course.isAvailable && (
									<div className={styles.lockedMessage}>
										🔒 Курс будет доступен после завершения предыдущих
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{courses.length === 0 && (
					<div className={styles.noCourses}>
						<p>Курсы пока не добавлены</p>
					</div>
				)}
			</div>
		</section>
	)
}

export default Courses
