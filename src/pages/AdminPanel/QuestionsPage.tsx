import React, { useEffect, useState } from 'react'
import styles from './QuestionsPage.module.scss'

interface Question {
	id: number
	text: string
	lectureId: number
	createdAt: string
	updatedAt: string
}

const QuestionsPage: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		fetchQuestions()
	}, [])

	const fetchQuestions = async () => {
		try {
			setLoading(true)
			// TODO: Заменить на реальный API вызов
			const mockQuestions: Question[] = [
				{
					id: 1,
					text: 'Что такое обучение?',
					lectureId: 1,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
				},
				{
					id: 2,
					text: 'Каковы правила безопасности?',
					lectureId: 2,
					createdAt: '2024-01-02T00:00:00Z',
					updatedAt: '2024-01-02T00:00:00Z',
				},
			]
			setQuestions(mockQuestions)
			setError('')
		} catch {
			setError('Ошибка загрузки вопросов')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateQuestion = () => {
		// TODO: Реализовать создание вопроса
		console.log('Создание вопроса')
	}

	const handleEditQuestion = (question: Question) => {
		// TODO: Реализовать редактирование вопроса
		console.log('Редактирование вопроса:', question)
	}

	const handleDeleteQuestion = (question: Question) => {
		// TODO: Реализовать удаление вопроса
		console.log('Удаление вопроса:', question)
	}

	const filteredQuestions = questions.filter(q =>
		q.text.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU')
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка вопросов...</div>
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>Управление вопросами</h1>
				<button className={styles.createBtn} onClick={handleCreateQuestion}>
					Создать вопрос
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchContainer}>
				<input
					type='text'
					placeholder='Поиск вопросов...'
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
							<th>Текст вопроса</th>
							<th>ID лекции</th>
							<th>Дата создания</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredQuestions.length === 0 ? (
							<tr>
								<td colSpan={5} className={styles.emptyMessage}>
									Вопросы не найдены
								</td>
							</tr>
						) : (
							filteredQuestions.map(question => (
								<tr key={question.id}>
									<td>{question.id}</td>
									<td>{question.text}</td>
									<td>{question.lectureId}</td>
									<td>{formatDate(question.createdAt)}</td>
									<td>
										<div className={styles.actions}>
											<button
												className={styles.editBtn}
												onClick={() => handleEditQuestion(question)}
											>
												Редактировать
											</button>
											<button
												className={styles.deleteBtn}
												onClick={() => handleDeleteQuestion(question)}
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

export default QuestionsPage
