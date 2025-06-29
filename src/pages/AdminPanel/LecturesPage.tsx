import React, { useEffect, useState } from 'react'
import PermissionErrorModal from '../../components/PermissionErrorModal/PermissionErrorModal'
import { usePermissions } from '../../hooks/usePermissions'
import { Permission } from '../../types/permissions'
import lecturesApi, {
	CreateLectureData,
	Lecture,
	UpdateLectureData,
} from '../../utils/lecturesApi'
import ConfirmModal from './ConfirmModal'
import LectureModal from './LectureModal'
import styles from './LecturesPage.module.scss'

const LecturesPage: React.FC = () => {
	const [lectures, setLectures] = useState<Lecture[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null)

	// Модальное окно ошибки прав
	const [permissionError, setPermissionError] = useState<{
		isOpen: boolean
		action: string
	}>({
		isOpen: false,
		action: '',
	})

	const { hasPermission } = usePermissions()

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
		if (!hasPermission(Permission.MANAGE_LECTURES)) {
			setPermissionError({
				isOpen: true,
				action: 'создавать лекции',
			})
			return
		}
		setEditingLecture(null)
		setIsModalOpen(true)
	}

	const handleEditLecture = (lecture: Lecture) => {
		if (!hasPermission(Permission.MANAGE_LECTURES)) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать лекции',
			})
			return
		}
		setEditingLecture(lecture)
		setIsModalOpen(true)
	}

	const handleDeleteLecture = (lecture: Lecture) => {
		if (!hasPermission(Permission.MANAGE_LECTURES)) {
			setPermissionError({
				isOpen: true,
				action: 'удалять лекции',
			})
			return
		}
		setLectureToDelete(lecture)
		setIsConfirmModalOpen(true)
	}

	const confirmDeleteLecture = async () => {
		if (!lectureToDelete) return

		try {
			await lecturesApi.deleteLecture(lectureToDelete.id)
			await fetchLectures()
		} catch {
			setError('Ошибка удаления лекции')
		}
	}

	const handleSaveLecture = async (
		lectureData: CreateLectureData | UpdateLectureData
	) => {
		try {
			if (editingLecture) {
				if (!hasPermission(Permission.MANAGE_LECTURES)) {
					setPermissionError({
						isOpen: true,
						action: 'редактировать лекции',
					})
					return
				}
				await lecturesApi.updateLecture(
					editingLecture.id,
					lectureData as UpdateLectureData
				)
			} else {
				if (!hasPermission(Permission.MANAGE_LECTURES)) {
					setPermissionError({
						isOpen: true,
						action: 'создавать лекции',
					})
					return
				}
				await lecturesApi.createLecture(lectureData as CreateLectureData)
			}
			await fetchLectures()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Ошибка сохранения лекции'
			throw new Error(errorMessage)
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

			<LectureModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				lecture={editingLecture}
				onSave={handleSaveLecture}
			/>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={confirmDeleteLecture}
				title='Подтверждение удаления'
				message={`Вы уверены, что хотите удалить лекцию "${lectureToDelete?.title}"?`}
				confirmText='Удалить'
				cancelText='Отмена'
			/>

			{/* Модальное окно ошибки прав */}
			<PermissionErrorModal
				isOpen={permissionError.isOpen}
				onClose={() => setPermissionError({ isOpen: false, action: '' })}
				action={permissionError.action}
			/>
		</div>
	)
}

export default LecturesPage
