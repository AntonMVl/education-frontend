import React, { useEffect, useState } from 'react'
import questionsApi, {
	CreateQuestionData,
	Question,
	UpdateQuestionData,
} from '../../utils/questionsApi'
import ConfirmModal from './ConfirmModal'
import QuestionModal from './QuestionModal'
import styles from './QuestionsPage.module.scss'

const QuestionsPage: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
		null
	)

	useEffect(() => {
		fetchQuestions()
	}, [])

	const fetchQuestions = async () => {
		try {
			setLoading(true)
			const data = await questionsApi.getQuestions()
			setQuestions(data)
			setError('')
		} catch {
			setError('Ошибка загрузки вопросов')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateQuestion = () => {
		setEditingQuestion(null)
		setIsModalOpen(true)
	}

	const handleEditQuestion = (question: Question) => {
		setEditingQuestion(question)
		setIsModalOpen(true)
	}

	const handleDeleteQuestion = (question: Question) => {
		setQuestionToDelete(question)
		setIsConfirmModalOpen(true)
	}

	const confirmDeleteQuestion = async () => {
		if (!questionToDelete) return

		try {
			await questionsApi.deleteQuestion(questionToDelete.id)
			await fetchQuestions()
		} catch {
			setError('Ошибка удаления вопроса')
		}
	}

	const handleSaveQuestion = async (
		questionData: CreateQuestionData | UpdateQuestionData
	) => {
		try {
			if (editingQuestion) {
				await questionsApi.updateQuestion(
					editingQuestion.id,
					questionData as UpdateQuestionData
				)
			} else {
				await questionsApi.createQuestion(questionData as CreateQuestionData)
			}
			await fetchQuestions()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Ошибка сохранения вопроса'
			throw new Error(errorMessage)
		}
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
									<td className={styles.questionText}>
										{question.text.length > 100
											? `${question.text.substring(0, 100)}...`
											: question.text}
									</td>
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

			<QuestionModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				question={editingQuestion}
				onSave={handleSaveQuestion}
			/>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={confirmDeleteQuestion}
				title='Подтверждение удаления'
				message={`Вы уверены, что хотите удалить вопрос "${questionToDelete?.text.substring(
					0,
					50
				)}..."?`}
				confirmText='Удалить'
				cancelText='Отмена'
			/>
		</div>
	)
}

export default QuestionsPage
