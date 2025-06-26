import React, { useEffect, useState } from 'react'
import adminApi from '../../api/adminApi'
import AdminPermissionsEdit from '../../components/AdminPermissionsEdit/AdminPermissionsEdit'
import AdminPermissionsInfo from '../../components/AdminPermissionsInfo/AdminPermissionsInfo'
import PermissionErrorModal from '../../components/PermissionErrorModal/PermissionErrorModal'
import { usePermissions } from '../../hooks/usePermissions'
import {
	AdminPermissionsResponse,
	AdminWithPermissions,
	Permission,
	Permission as PermissionType,
} from '../../types/permissions'
import styles from './AdminsPage.module.scss'

const AdminsPage: React.FC = () => {
	const [admins, setAdmins] = useState<AdminWithPermissions[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedRole, setSelectedRole] = useState<string>('all')

	// Модальные окна
	const [permissionsInfo, setPermissionsInfo] =
		useState<AdminPermissionsResponse | null>(null)
	const [permissionsEdit, setPermissionsEdit] =
		useState<AdminPermissionsResponse | null>(null)
	const [isEditLoading, setIsEditLoading] = useState(false)

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
		loadAdmins()
	}, [])

	const loadAdmins = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await adminApi.getAllAdmins()
			setAdmins(data)
		} catch (err) {
			setError('Ошибка при загрузке администраторов')
			console.error('Error loading admins:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleViewPermissions = async (adminId: number) => {
		try {
			const data = await adminApi.getAdminPermissions(adminId)
			setPermissionsInfo(data)
		} catch (err) {
			setError('Ошибка при загрузке прав администратора')
			console.error('Error loading admin permissions:', err)
		}
	}

	const handleEditPermissions = async (adminId: number) => {
		if (!hasPermission(Permission.MANAGE_ADMINS)) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать права администраторов',
			})
			return
		}

		try {
			const data = await adminApi.getAdminPermissions(adminId)
			setPermissionsEdit(data)
		} catch (err) {
			setError('Ошибка при загрузке прав администратора')
			console.error('Error loading admin permissions:', err)
		}
	}

	const handleSavePermissions = async (permissions: PermissionType[]) => {
		if (!permissionsEdit) return

		if (!hasPermission(Permission.MANAGE_ADMINS)) {
			setPermissionError({
				isOpen: true,
				action: 'сохранять права администраторов',
			})
			return
		}

		try {
			setIsEditLoading(true)
			await adminApi.updateAdminPermissions(
				permissionsEdit.admin.id,
				permissions
			)
			setPermissionsEdit(null)
			loadAdmins() // Перезагружаем список для обновления данных
		} catch (err) {
			setError('Ошибка при сохранении прав администратора')
			console.error('Error saving admin permissions:', err)
		} finally {
			setIsEditLoading(false)
		}
	}

	const filteredAdmins = admins.filter(admin => {
		const matchesSearch =
			admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			admin.login.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesRole = selectedRole === 'all' || admin.role === selectedRole

		return matchesSearch && matchesRole
	})

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU')
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка администраторов...</div>
	}

	return (
		<div className={styles.adminsPage}>
			<div className={styles.header}>
				<h1>Управление администраторами</h1>
				<p>Просмотр и управление правами администраторов системы</p>
			</div>

			{error && (
				<div className={styles.error}>
					{error}
					<button onClick={() => setError(null)}>×</button>
				</div>
			)}

			<div className={styles.filters}>
				<div className={styles.searchContainer}>
					<input
						type='text'
						placeholder='Поиск по имени, фамилии или логину...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className={styles.searchInput}
					/>
				</div>

				<div className={styles.roleFilter}>
					<select
						value={selectedRole}
						onChange={e => setSelectedRole(e.target.value)}
						className={styles.roleSelect}
					>
						<option value='all'>Все роли</option>
						<option value='admin'>Администраторы</option>
						<option value='superadmin'>Суперадминистраторы</option>
					</select>
				</div>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.adminsTable}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Имя</th>
							<th>Фамилия</th>
							<th>Логин</th>
							<th>Роль</th>
							<th>Город</th>
							<th>Дата регистрации</th>
							<th>Количество прав</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredAdmins.map(admin => (
							<tr key={admin.id}>
								<td>{admin.id}</td>
								<td>{admin.firstName}</td>
								<td>{admin.lastName}</td>
								<td>{admin.login}</td>
								<td>
									<span className={`${styles.role} ${styles[admin.role]}`}>
										{admin.role === 'superadmin'
											? 'Суперадминистратор'
											: 'Администратор'}
									</span>
								</td>
								<td>{admin.city}</td>
								<td>{formatDate(admin.createdAt)}</td>
								<td>
									<span className={styles.permissionsCount}>
										{admin.permissions.length} прав
									</span>
								</td>
								<td>
									<div className={styles.actions}>
										<button
											className={styles.actionButton}
											onClick={() => handleViewPermissions(admin.id)}
											title='Просмотр прав'
										>
											Информация
										</button>
										<button
											className={`${styles.actionButton} ${styles.editButton}`}
											onClick={() => handleEditPermissions(admin.id)}
											title='Редактировать права'
										>
											Редактировать
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredAdmins.length === 0 && (
					<div className={styles.noData}>
						{searchTerm || selectedRole !== 'all'
							? 'Администраторы не найдены'
							: 'Администраторы не найдены'}
					</div>
				)}
			</div>

			{/* Модальные окна */}
			{permissionsInfo && (
				<AdminPermissionsInfo
					data={permissionsInfo}
					onClose={() => setPermissionsInfo(null)}
				/>
			)}

			{permissionsEdit && (
				<AdminPermissionsEdit
					data={permissionsEdit}
					onSave={handleSavePermissions}
					onClose={() => setPermissionsEdit(null)}
					isLoading={isEditLoading}
				/>
			)}

			{/* Модальное окно ошибки прав */}
			<PermissionErrorModal
				isOpen={permissionError.isOpen}
				onClose={() => setPermissionError({ isOpen: false, action: '' })}
				action={permissionError.action}
			/>
		</div>
	)
}

export default AdminsPage
