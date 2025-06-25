import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatRoleForDisplay } from '../../constants/DropDownOptionValuse'
import { RootState } from '../../store/store'
import { AdminUser } from '../../utils/adminApi'
import adminsApi, {
	Admin,
	CreateAdminData,
	UpdateAdminData,
} from '../../utils/adminsApi'
import styles from './AdminsPage.module.scss'
import ConfirmModal from './ConfirmModal'
import PasswordModal from './PasswordModal'
import UserInfoModal from './UserInfoModal'
import UserModal from './UserModal'

const AdminsPage: React.FC = () => {
	const [admins, setAdmins] = useState<Admin[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
	const [tempPassword, setTempPassword] = useState('')
	const [tempAdminLogin, setTempAdminLogin] = useState('')
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

	const currentUser = useSelector((state: RootState) => state.user.user)

	useEffect(() => {
		fetchAdmins()
	}, [])

	const fetchAdmins = async () => {
		try {
			setLoading(true)
			const data = await adminsApi.getAdmins()
			setAdmins(data)
			setError('')
		} catch {
			setError('Ошибка загрузки администраторов')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateAdmin = () => {
		setEditingAdmin(null)
		setIsModalOpen(true)
	}

	const handleEditAdmin = (admin: Admin) => {
		setEditingAdmin(admin)
		setIsModalOpen(true)
	}

	const handleShowAdminInfo = (admin: Admin) => {
		setSelectedAdmin(admin)
		setIsInfoModalOpen(true)
	}

	const handleDeleteAdmin = (admin: Admin) => {
		if (!canDeleteAdmin(admin)) {
			setError('У вас нет прав для удаления этого администратора')
			return
		}
		setAdminToDelete(admin)
		setIsConfirmModalOpen(true)
	}

	const confirmDeleteAdmin = async () => {
		if (!adminToDelete) return

		try {
			await adminsApi.deleteAdmin(adminToDelete.id)
			await fetchAdmins()
		} catch {
			setError('Ошибка удаления администратора')
		}
	}

	const handleSaveAdmin = async (
		adminData: CreateAdminData | UpdateAdminData
	) => {
		try {
			if (editingAdmin) {
				await adminsApi.updateAdmin(
					editingAdmin.id,
					adminData as UpdateAdminData
				)
			} else {
				const result = await adminsApi.createAdmin(adminData as CreateAdminData)
				// Показываем временный пароль
				setTempPassword(result.plainPassword)
				setTempAdminLogin(result.admin.login)
				setIsPasswordModalOpen(true)
			}
			await fetchAdmins()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Ошибка сохранения администратора'
			setError(errorMessage)
		}
	}

	const handleBlockAdmin = async (admin: Admin) => {
		if (!canBlockAdmin(admin)) {
			setError('У вас нет прав для блокировки этого администратора')
			return
		}

		try {
			await adminsApi.blockAdmin(admin.id)
			await fetchAdmins()
		} catch {
			setError('Ошибка блокировки администратора')
		}
	}

	const filteredAdmins = admins.filter(
		admin =>
			admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			admin.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
			admin.city.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const sortAdminsByRole = (admins: Admin[]) => {
		const roleOrder = { user: 1, admin: 2, superadmin: 3 }
		return admins.sort((a, b) => {
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

	const sortedAdmins = sortAdminsByRole(filteredAdmins)

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

	const canEditAdmin = (admin: Admin) => {
		if (!currentUser) return false

		// Пользователь не может редактировать сам себя
		if (currentUser.id === admin.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()

		// Суперадмин может редактировать всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ не может редактировать других админов
		return false
	}

	const canDeleteAdmin = (admin: Admin) => {
		if (!currentUser) return false

		// Пользователь не может удалить сам себя
		if (currentUser.id === admin.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()

		// Суперадмин может удалять всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ не может удалять других админов
		return false
	}

	const canBlockAdmin = (admin: Admin) => {
		if (!currentUser) return false

		// Пользователь не может заблокировать сам себя
		if (currentUser.id === admin.id) return false

		const currentUserRole = currentUser.role?.toLowerCase()

		// Суперадмин может блокировать всех (кроме себя)
		if (currentUserRole === 'superadmin') return true

		// Админ не может блокировать других админов
		return false
	}

	const renderAdminRows = () => {
		if (sortedAdmins.length === 0) {
			return (
				<tr>
					<td colSpan={8} className={styles.emptyMessage}>
						Администраторы не найдены
					</td>
				</tr>
			)
		}

		const rows: JSX.Element[] = []
		let currentRole = ''
		let adminIndex = 0

		sortedAdmins.forEach(admin => {
			const adminRole = admin.role.toLowerCase()

			// Добавляем разделитель при смене роли
			if (adminRole !== currentRole && currentRole !== '') {
				rows.push(
					<tr key={`separator-${adminRole}`} className={styles.roleSeparator}>
						<td colSpan={8} style={{ textAlign: 'center' }}>
							{getRoleLabel(adminRole).toUpperCase()}
						</td>
					</tr>
				)
			}

			currentRole = adminRole
			adminIndex++

			rows.push(
				<tr key={admin.id} className={styles.adminRow}>
					<td>{adminIndex}</td>
					<td>{admin.id}</td>
					<td>{admin.firstName}</td>
					<td>{admin.lastName}</td>
					<td>{admin.login}</td>
					<td>
						<span className={`${styles.role} ${getRoleStyleClass(admin.role)}`}>
							{getRoleLabel(admin.role)}
						</span>
					</td>
					<td>{admin.city}</td>
					<td>
						<div className={styles.actions}>
							{canEditAdmin(admin) && (
								<button
									className={styles.editBtn}
									onClick={() => handleEditAdmin(admin)}
								>
									Редактировать
								</button>
							)}
							{canDeleteAdmin(admin) && (
								<button
									className={styles.deleteBtn}
									onClick={() => handleDeleteAdmin(admin)}
								>
									Удалить
								</button>
							)}
							{canBlockAdmin(admin) && (
								<button
									className={styles.blockBtn}
									onClick={() => handleBlockAdmin(admin)}
								>
									Заблокировать
								</button>
							)}
							<button
								className={styles.infoBtn}
								onClick={() => handleShowAdminInfo(admin)}
								title='Информация об администраторе'
							>
								ℹ️
							</button>
						</div>
					</td>
				</tr>
			)
		})

		return rows
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка администраторов...</div>
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>Управление администраторами</h1>
				<button className={styles.createBtn} onClick={handleCreateAdmin}>
					Создать администратора
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchContainer}>
				<input
					type='text'
					placeholder='Поиск администраторов...'
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
					<tbody>{renderAdminRows()}</tbody>
				</table>
			</div>

			<UserModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				user={editingAdmin}
				onSave={handleSaveAdmin}
			/>

			<UserInfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
				user={selectedAdmin}
				onSave={async () => {
					// Для админов редактирование через это модальное окно не поддерживается
					return selectedAdmin as AdminUser
				}}
				canEdit={false}
				startEditing={false}
			/>

			<PasswordModal
				isOpen={isPasswordModalOpen}
				onClose={() => setIsPasswordModalOpen(false)}
				plainPassword={tempPassword}
				userLogin={tempAdminLogin}
			/>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={confirmDeleteAdmin}
				title='Подтверждение удаления'
				message={`Вы уверены, что хотите удалить администратора "${adminToDelete?.firstName} ${adminToDelete?.lastName}"?`}
				confirmText='Удалить'
				cancelText='Отмена'
			/>
		</div>
	)
}

export default AdminsPage
