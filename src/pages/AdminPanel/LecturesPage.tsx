import React, { useEffect, useState } from 'react'
import lecturesApi, { Lecture } from '../../utils/lecturesApi'
import styles from './LecturesPage.module.scss'

const LecturesPage: React.FC = () => {
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		fetchLectures()
	}, [])

	const fetchLectures = async () => {
		try {
			setLoading(true)
			const data = await lecturesApi.getLectures()
			setLectures(data)
			setError('')
		} catch {
			setError('Ошибка загрузки лекций')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateLecture = () => {
		// TODO: Реализовать создание лекции через модальное окно
		console.log('Создание лекции')
	}

	const handleEditLecture = (lecture: Lecture) => {
		// TODO: Реализовать редактирование лекции через модальное окно
		console.log('Редактирование лекции:', lecture)
	}

	const handleDeleteLecture = async (lecture: Lecture) => {
		if (
			!window.confirm(
				`Вы уверены, что хотите удалить лекцию "${lecture.title}"?`
			)
		) {
			return
		}

		try {
			await lecturesApi.deleteLecture(lecture.id)
			await fetchLectures() // обновляем список
		} catch {
			setError('Ошибка удаления лекции')
		}
	}

	const filteredLectures = lectures.filter(
		lecture =>
			lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lecture.description.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU')
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка лекций...</div>
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>Управление лекциями</h1>
				<button className={styles.createBtn} onClick={handleCreateLecture}>
					Создать лекцию
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchContainer}>
				<input
					type='text'
					placeholder='Поиск лекций...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className={styles.searchInput}
				/>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Название</th>
							<th>Описание</th>
							<th>Порядок</th>
							<th>Дата создания</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredLectures.length === 0 ? (
							<tr>
								<td colSpan={6} className={styles.emptyMessage}>
									Лекции не найдены
								</td>
							</tr>
						) : (
							filteredLectures.map(lecture => (
								<tr key={lecture.id}>
									<td>{lecture.id}</td>
									<td>{lecture.title}</td>
									<td className={styles.description}>
										{lecture.description.length > 50
											? `${lecture.description.substring(0, 50)}...`
											: lecture.description}
									</td>
									<td>{lecture.order}</td>
									<td>{formatDate(lecture.createdAt)}</td>
									<td>
										<div className={styles.actions}>
											<button
												className={styles.editBtn}
												onClick={() => handleEditLecture(lecture)}
											>
												Редактировать
											</button>
											<button
												className={styles.deleteBtn}
												onClick={() => handleDeleteLecture(lecture)}
											>
												Удалить
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default LecturesPage
