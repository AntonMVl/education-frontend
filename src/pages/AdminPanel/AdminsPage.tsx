import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import adminApi from '../../api/adminApi'
import AdminPermissionsEdit from '../../components/AdminPermissionsEdit/AdminPermissionsEdit'
import PermissionErrorModal from '../../components/PermissionErrorModal/PermissionErrorModal'
import { RootState } from '../../store/store'
import { AdminWithPermissions, Permission } from '../../types/permissions'
import styles from './AdminsPage.module.scss'
import ConfirmModal from './ConfirmModal'

const AdminsPage: React.FC = () => {
	const [admins, setAdmins] = useState<AdminWithPermissions[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editingAdmin, setEditingAdmin] = useState<AdminWithPermissions | null>(
		null
	)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [adminToDelete, setAdminToDelete] =
		useState<AdminWithPermissions | null>(null)

	// Модальное окно ошибки прав
	const [permissionError, setPermissionError] = useState<{
		isOpen: boolean
		action: string
	}>({
		isOpen: false,
		action: '',
	})

	const user = useSelector((state: RootState) => state.user.user)

	// Определяем права текущего пользователя
	const canManageAdmins =
		user?.role === 'superadmin' || user?.permissions?.includes('manage_admins')

	const canManagePermissions =
		user?.role === 'superadmin' ||
		user?.permissions?.includes('manage_admin_permissions')

	// Проверяем, может ли пользователь управлять конкретным администратором
	const canManageAdmin = (admin: AdminWithPermissions) => {
		// Суперадмин может управлять всеми (кроме себя)
		if (user?.role === 'superadmin') return admin.id !== user?.id

		// Админ не может управлять суперадминами
		if (admin.role === 'superadmin') return false

		// Админ не может управлять собой
		if (admin.id === user?.id) return false

		// Админ может управлять другими админами, если у него есть права
		return canManageAdmins
	}

	// Проверяем, может ли пользователь редактировать разрешения конкретного администратора
	const canEditAdminPermissions = (admin: AdminWithPermissions) => {
		// Суперадмин может редактировать всех (кроме себя)
		if (user?.role === 'superadmin') return admin.id !== user?.id

		// Админ не может редактировать разрешения суперадминов
		if (admin.role === 'superadmin') return false

		// Админ не может редактировать свои разрешения
		if (admin.id === user?.id) return false

		// Админ может редактировать разрешения других админов, если у него есть права
		return canManagePermissions
	}

	// Проверяем, нужно ли скрыть кнопки для конкретного администратора
	const shouldHideButtons = (admin: AdminWithPermissions) => {
		// Суперадмин не видит кнопки у себя
		if (user?.role === 'superadmin' && admin.id === user?.id) {
			return true
		}

		// Админ не видит кнопки у суперадминов и у себя
		if (user?.role === 'admin') {
			// Скрываем кнопки для суперадминов
			if (admin.role === 'superadmin') return true

			// Скрываем кнопки для себя
			if (admin.id === user?.id) return true
		}

		return false
	}

	useEffect(() => {
		loadAdmins()
	}, [])

	const loadAdmins = async () => {
		try {
			setLoading(true)
			const response = await adminApi.getAllAdmins()
			console.log('Admins response:', response)
			setAdmins(response)
			setError(null)
		} catch (err) {
			setError('Ошибка при загрузке администраторов')
			console.error('Error loading admins:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleEditPermissions = (admin: AdminWithPermissions) => {
		if (!canEditAdminPermissions(admin)) {
			setPermissionError({
				isOpen: true,
				action: 'управлять правами администраторов',
			})
			return
		}
		setEditingAdmin(admin)
	}

	const handleSavePermissions = async (permissions: Permission[]) => {
		if (!editingAdmin) return

		try {
			await adminApi.updateAdminPermissions(editingAdmin.id, permissions)
			await loadAdmins() // Перезагружаем список
			setEditingAdmin(null)
		} catch (err) {
			console.error('Error updating permissions:', err)
		}
	}

	const handleDeleteAdmin = (admin: AdminWithPermissions) => {
		if (!canManageAdmin(admin)) {
			setPermissionError({
				isOpen: true,
				action: 'удалять администраторов',
			})
			return
		}
		setAdminToDelete(admin)
		setShowConfirmModal(true)
	}

	const confirmDelete = async () => {
		if (!adminToDelete) return

		try {
			// Удаляем администратора через API
			await adminApi.deleteUser(adminToDelete.id)
			await loadAdmins()
			setShowConfirmModal(false)
			setAdminToDelete(null)
		} catch (err: unknown) {
			console.error('Error deleting admin:', err)

			// Показываем пользователю понятное сообщение об ошибке
			let errorMessage = 'Ошибка при удалении администратора'

			if (
				err &&
				typeof err === 'object' &&
				'response' in err &&
				err.response &&
				typeof err.response === 'object' &&
				'data' in err.response &&
				err.response.data &&
				typeof err.response.data === 'object' &&
				'message' in err.response.data
			) {
				errorMessage = String(err.response.data.message)
			} else if (err instanceof Error) {
				errorMessage = err.message
			}

			setError(errorMessage)

			// Закрываем модальное окно подтверждения
			setShowConfirmModal(false)
			setAdminToDelete(null)
		}
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка...</div>
	}

	if (error) {
		return <div className={styles.error}>{error}</div>
	}

	return (
		<div className={styles.adminsPage}>
			<div className={styles.header}>
				<h2>Управление администраторами</h2>
				<p>Всего администраторов: {admins.length}</p>
			</div>

			<div className={styles.adminsList}>
				{admins.map(admin => (
					<div key={admin.id} className={styles.adminCard}>
						<div className={styles.adminInfo}>
							<h3>
								{admin.firstName} {admin.lastName}
								{admin.role === 'superadmin' && (
									<span className={styles.superadminBadge}>Суперадмин</span>
								)}
							</h3>
							<p>{admin.login}</p>
							<p className={styles.date}>
								Создан: {new Date(admin.createdAt).toLocaleDateString()}
							</p>
							<div className={styles.permissions}>
								<strong>Разрешения:</strong>
								<ul>
									{(admin.permissions || []).map(permission => (
										<li key={permission.permission}>
											{permission.displayName}
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className={styles.actions}>
							{!shouldHideButtons(admin) && (
								<button
									onClick={() => handleEditPermissions(admin)}
									className={styles.editButton}
								>
									Редактировать разрешения
								</button>
							)}
							{!shouldHideButtons(admin) && (
								<button
									onClick={() => handleDeleteAdmin(admin)}
									className={styles.deleteButton}
								>
									Удалить
								</button>
							)}
							{admin.role === 'superadmin' && user?.role !== 'superadmin' && (
								<p className={styles.protectedNote}>
									Суперадмин защищен от изменений
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{editingAdmin && (
				<AdminPermissionsEdit
					data={{
						admin: {
							id: editingAdmin.id,
							firstName: editingAdmin.firstName,
							lastName: editingAdmin.lastName,
							login: editingAdmin.login,
							role: editingAdmin.role,
						},
						permissions: editingAdmin.permissions || [],
					}}
					onSave={handleSavePermissions}
					onClose={() => setEditingAdmin(null)}
				/>
			)}

			{showConfirmModal && adminToDelete && (
				<ConfirmModal
					isOpen={showConfirmModal}
					onClose={() => setShowConfirmModal(false)}
					onConfirm={confirmDelete}
					title='Подтверждение удаления'
					message={`Вы уверены, что хотите удалить администратора "${adminToDelete.firstName} ${adminToDelete.lastName}"?`}
				/>
			)}

			<PermissionErrorModal
				isOpen={permissionError.isOpen}
				onClose={() => setPermissionError({ isOpen: false, action: '' })}
				action={permissionError.action}
			/>
		</div>
	)
}

export default AdminsPage
