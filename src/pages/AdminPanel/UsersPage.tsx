import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatRoleForDisplay } from '../../constants/DropDownOptionValuse'
import { RootState } from '../../store/store'
import adminApi, {
	AdminUser,
	CreateUserData,
	UpdateUserData,
} from '../../utils/adminApi'
import ConfirmModal from './ConfirmModal'
import PasswordModal from './PasswordModal'
import UserInfoModal from './UserInfoModal'
import UserModal from './UserModal'
import styles from './UsersPage.module.scss'

const UsersPage: React.FC = () => {
	const [users, setUsers] = useState<AdminUser[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
	const [infoModalStartEditing, setInfoModalStartEditing] = useState(false)
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
	const [tempPassword, setTempPassword] = useState('')
	const [tempUserLogin, setTempUserLogin] = useState('')

	const currentUser = useSelector((state: RootState) => state.user.user)

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			setLoading(true)
			const data = await adminApi.getUsers()
			setUsers(data)
			setError('')
		} catch {
			setError('Ошибка загрузки пользователей')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateUser = () => {
		setEditingUser(null)
		setIsModalOpen(true)
	}

	const handleEditUser = (user: AdminUser) => {
		setSelectedUser(user)
		setIsInfoModalOpen(true)
		setInfoModalStartEditing(true)
	}

	const handleShowUserInfo = (user: AdminUser) => {
		setSelectedUser(user)
		setIsInfoModalOpen(true)
		setInfoModalStartEditing(false)
	}

	const handleDeleteUser = (user: AdminUser) => {
		if (!canDeleteUser(user)) {
			setError('У вас нет прав для удаления этого пользователя')
			return
		}
		setUserToDelete(user)
		setIsConfirmModalOpen(true)
	}

	const confirmDeleteUser = async () => {
		if (!userToDelete) return

		try {
			await adminApi.deleteUser(userToDelete.id)
			await fetchUsers()
		} catch {
			setError('Ошибка удаления пользователя')
		}
	}

	const handleSaveUser = async (userData: CreateUserData | UpdateUserData) => {
		try {
			if (editingUser) {
				await adminApi.updateUser(editingUser.id, userData as UpdateUserData)
			} else {
				const result = await adminApi.createUser(userData as CreateUserData)
				// Показываем временный пароль
				setTempPassword(result.plainPassword)
				setTempUserLogin(result.user.login)
				setIsPasswordModalOpen(true)
			}
			await fetchUsers()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Ошибка сохранения пользователя'
			setError(errorMessage)
		}
	}

	const handleSaveUserInfo = async (
		userData: UpdateUserData
	): Promise<AdminUser> => {
		if (!selectedUser) {
			throw new Error('Пользователь не выбран')
		}

		const updatedUser = await adminApi.updateUser(selectedUser.id, userData)
		await fetchUsers()
		// Обновляем selectedUser с данными от сервера
		setSelectedUser(updatedUser)
		// Переключаем модальное окно в режим просмотра
		setInfoModalStartEditing(false)
		return updatedUser
	}

	const filteredUsers = users.filter(
		user =>
			user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.city.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const sortUsersByRole = (users: AdminUser[]) => {
		const roleOrder = { user: 1, admin: 2, superadmin: 3 }
		return users.sort((a, b) => {
			const roleA =
				roleOrder[a.role.toLowerCase() as keyof typeof roleOrder] || 0
			const roleB =
				roleOrder[b.role.toLowerCase() as keyof typeof roleOrder] || 0
			if (roleA !== roleB) {
				return roleA - roleB
			}
			// Если роли одинаковые, сортируем по ID
			return a.id - b.id
		})
	}

	const sortedUsers = sortUsersByRole(filteredUsers)

	const getRoleLabel = (role: string) => {
		return formatRoleForDisplay(role)
	}

	const getRoleStyleClass = (role: string) => {
		const normalizedRole = role.toLowerCase()
		switch (normalizedRole) {
			case 'superadmin':
				return styles.roleSuperAdmin
			case 'admin':
				return styles.roleAdmin
			case 'user':
				return styles.roleUser
			default:
				return styles.roleUser
		}
	}

	const canEditUser = (user: AdminUser) => {
		if (!currentUser) return false

		// Пользователь не может редактировать сам себя
		if (currentUser.id === user.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()
		const targetUserRole = user.role?.toLowerCase()

		// Суперадмин может редактировать всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ может редактировать только обычных пользователей (кроме себя)
		if (currentUserRole === 'admin' && targetUserRole === 'user') return true

		return false
	}

	const canDeleteUser = (user: AdminUser) => {
		if (!currentUser) return false

		// Пользователь не может удалить сам себя
		if (currentUser.id === user.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()
		const targetUserRole = user.role?.toLowerCase()

		// Суперадмин может удалять всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ может удалять только обычных пользователей (кроме себя)
		if (currentUserRole === 'admin' && targetUserRole === 'user') return true

		return false
	}

	const renderUserRows = () => {
		if (sortedUsers.length === 0) {
			return (
				<tr>
					<td colSpan={8} className={styles.emptyMessage}>
						Пользователи не найдены
					</td>
				</tr>
			)
		}

		const rows: JSX.Element[] = []
		let currentRole = ''
		let userIndex = 0

		sortedUsers.forEach(user => {
			const userRole = user.role.toLowerCase()

			// Добавляем разделитель при смене роли
			if (userRole !== currentRole && currentRole !== '') {
				rows.push(
					<tr key={`separator-${userRole}`} className={styles.roleSeparator}>
						<td colSpan={8} style={{ textAlign: 'center' }}>
							{getRoleLabel(userRole).toUpperCase()}
						</td>
					</tr>
				)
			}

			currentRole = userRole
			userIndex++

			rows.push(
				<tr key={user.id} className={styles.userRow}>
					<td>{userIndex}</td>
					<td>{user.id}</td>
					<td>{user.firstName}</td>
					<td>{user.lastName}</td>
					<td>{user.login}</td>
					<td>
						<span className={`${styles.role} ${getRoleStyleClass(user.role)}`}>
							{getRoleLabel(user.role)}
						</span>
					</td>
					<td>{user.city}</td>
					<td>
						<div className={styles.actions}>
							<button
								className={styles.infoBtn}
								onClick={() => handleShowUserInfo(user)}
								title='Информация о пользователе'
							>
								ℹ️
							</button>
							{canEditUser(user) && (
								<button
									className={styles.editBtn}
									onClick={() => handleEditUser(user)}
								>
									Редактировать
								</button>
							)}
							{canDeleteUser(user) && (
								<button
									className={styles.deleteBtn}
									onClick={() => handleDeleteUser(user)}
								>
									Удалить
								</button>
							)}
						</div>
					</td>
				</tr>
			)
		})

		return rows
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка пользователей...</div>
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>Управление пользователями</h1>
				<button className={styles.createBtn} onClick={handleCreateUser}>
					Создать пользователя
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchContainer}>
				<input
					type='text'
					placeholder='Поиск пользователей...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className={styles.searchInput}
				/>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>№</th>
							<th>ID</th>
							<th>Имя</th>
							<th>Фамилия</th>
							<th>Логин</th>
							<th>Роль</th>
							<th>Город</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>{renderUserRows()}</tbody>
				</table>
			</div>

			<UserModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				user={editingUser}
				onSave={handleSaveUser}
			/>

			<UserInfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
				user={selectedUser}
				onSave={handleSaveUserInfo}
				canEdit={selectedUser ? canEditUser(selectedUser) : false}
				startEditing={infoModalStartEditing}
			/>

			<PasswordModal
				isOpen={isPasswordModalOpen}
				onClose={() => setIsPasswordModalOpen(false)}
				plainPassword={tempPassword}
				userLogin={tempUserLogin}
			/>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={confirmDeleteUser}
				title='Подтверждение удаления'
				message={`Вы уверены, что хотите удалить пользователя "${userToDelete?.firstName} ${userToDelete?.lastName}"?`}
				confirmText='Удалить'
				cancelText='Отмена'
			/>
		</div>
	)
}

export default UsersPage
