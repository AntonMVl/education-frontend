import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PermissionErrorModal from '../../components/PermissionErrorModal/PermissionErrorModal'
import {
	getRoleDisplayName,
	normalizeRoleValue,
} from '../../constants/DropDownOptionValuse'
import { RootState } from '../../store/store'
import adminApi, { AdminUser, UpdateUserData } from '../../utils/adminApi'
import ConfirmModal from './ConfirmModal'
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

	// Модальное окно ошибки прав
	const [permissionError, setPermissionError] = useState<{
		isOpen: boolean
		action: string
	}>({
		isOpen: false,
		action: '',
	})

	const currentUser = useSelector((state: RootState) => state.user.user)

	// Определяем права текущего пользователя
	const canCreateUsers =
		currentUser?.role === 'superadmin' ||
		currentUser?.permissions?.includes('create_users')

	const canEditUsers =
		currentUser?.role === 'superadmin' ||
		currentUser?.permissions?.includes('edit_users')

	const canDeleteUsers =
		currentUser?.role === 'superadmin' ||
		currentUser?.permissions?.includes('delete_users')

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
		if (!canCreateUsers) {
			setPermissionError({
				isOpen: true,
				action: 'создавать пользователей',
			})
			return
		}
		setEditingUser(null)
		setIsModalOpen(true)
	}

	const handleEditUser = (user: AdminUser) => {
		if (!canEditUser(user)) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать этого пользователя',
			})
			return
		}
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
		if (!canDeleteUsers) {
			setPermissionError({
				isOpen: true,
				action: 'удалять пользователей',
			})
			return
		}

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

	const handleSaveUserInfo = async (
		userData: UpdateUserData
	): Promise<AdminUser> => {
		if (!selectedUser) {
			throw new Error('Пользователь не выбран')
		}

		// Пользователь может редактировать свои данные по умолчанию
		const isEditingSelf = currentUser?.id === selectedUser.id
		if (!isEditingSelf && !canEditUsers) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать пользователей',
			})
			throw new Error('Недостаточно прав')
		}

		const updatedUser = await adminApi.updateUser(selectedUser.id, userData)
		await fetchUsers()
		// Обновляем selectedUser с данными от сервера
		setSelectedUser(updatedUser)
		// Переключаем модальное окно в режим просмотра
		setInfoModalStartEditing(false)
		return updatedUser
	}

	// Фильтрация пользователей
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
		return normalizeRoleValue(role)
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

		const currentUserRole = currentUser.role?.toLowerCase()
		const targetUserRole = user.role?.toLowerCase()

		// Пользователь может редактировать свои данные (включая админа)
		if (currentUser.id === user.id) return true

		// Суперадмин может редактировать всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ может редактировать пользователей и админов (кроме себя)
		if (currentUserRole === 'admin') {
			// Если редактируем админа, нужны права MANAGE_ADMINS
			if (targetUserRole === 'admin') {
				return currentUser?.permissions?.includes('manage_admins') || false
			}
			// Если редактируем пользователя, нужны права EDIT_USERS
			if (targetUserRole === 'user') {
				return currentUser?.permissions?.includes('edit_users') || false
			}
		}

		return false
	}

	const canDeleteUser = (user: AdminUser) => {
		if (!currentUser) return false

		// Пользователь не может удалить сам себя
		if (currentUser.id === user.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()
		const targetUserRole = user.role?.toLowerCase()

		// Суперадмин может удалять всех (кроме себя и других суперадминов)
		if (currentUserRole === 'superadmin') {
			return targetUserRole !== 'superadmin'
		}

		// Админ может удалять пользователей и админов (кроме себя)
		if (currentUserRole === 'admin') {
			// Если удаляем админа, нужны права MANAGE_ADMINS
			if (targetUserRole === 'admin') {
				return currentUser?.permissions?.includes('manage_admins') || false
			}
			// Если удаляем пользователя, нужны права DELETE_USERS
			if (targetUserRole === 'user') {
				return currentUser?.permissions?.includes('delete_users') || false
			}
		}

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
							{getRoleDisplayName(user.role)}
						</span>
					</td>
					<td>{user.city}</td>
					<td>
						{user.createdAt
							? new Date(user.createdAt).toLocaleDateString('ru-RU')
							: '-'}
					</td>
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
				{canCreateUsers && (
					<button className={styles.createBtn} onClick={handleCreateUser}>
						Создать пользователя
					</button>
				)}
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
							<th>Дата создания</th>
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
				onSuccess={fetchUsers}
			/>

			<UserInfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
				user={selectedUser}
				startEditing={infoModalStartEditing}
				onSave={handleSaveUserInfo}
				canEdit={true}
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

			<PermissionErrorModal
				isOpen={permissionError.isOpen}
				onClose={() => setPermissionError({ isOpen: false, action: '' })}
				action={permissionError.action}
			/>
		</div>
	)
}

export default UsersPage
