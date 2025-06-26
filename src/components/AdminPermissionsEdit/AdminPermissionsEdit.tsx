import React, { useEffect, useState } from 'react'
import {
	AdminPermissionsResponse,
	Permission,
	PermissionDisplayNames,
} from '../../types/permissions'
import styles from './AdminPermissionsEdit.module.scss'

interface AdminPermissionsEditProps {
	data: AdminPermissionsResponse
	onSave: (permissions: Permission[]) => void
	onClose: () => void
	isLoading?: boolean
}

const AdminPermissionsEdit: React.FC<AdminPermissionsEditProps> = ({
	data,
	onSave,
	onClose,
	isLoading = false,
}) => {
	const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
		[]
	)

	useEffect(() => {
		// Инициализируем выбранные права из данных
		setSelectedPermissions(data.permissions.map(p => p.permission))
	}, [data])

	const handlePermissionToggle = (permission: Permission) => {
		setSelectedPermissions(prev => {
			if (prev.includes(permission)) {
				return prev.filter(p => p !== permission)
			} else {
				return [...prev, permission]
			}
		})
	}

	const handleSave = () => {
		onSave(selectedPermissions)
	}

	const handleSelectAll = () => {
		setSelectedPermissions(Object.values(Permission))
	}

	const handleClearAll = () => {
		setSelectedPermissions([])
	}

	const allPermissions = Object.values(Permission)

	return (
		<div className={styles.modal}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2>Редактирование прав администратора</h2>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>

				<div className={styles.adminInfo}>
					<h3>
						{data.admin.firstName} {data.admin.lastName}
					</h3>
					<p>
						<strong>Логин:</strong> {data.admin.login}
					</p>
					<p>
						<strong>Роль:</strong> {data.admin.role}
					</p>
				</div>

				<div className={styles.permissionsSection}>
					<div className={styles.permissionsHeader}>
						<h3>Права доступа:</h3>
						<div className={styles.permissionsActions}>
							<button className={styles.actionButton} onClick={handleSelectAll}>
								Выбрать все
							</button>
							<button className={styles.actionButton} onClick={handleClearAll}>
								Очистить все
							</button>
						</div>
					</div>

					<div className={styles.permissionsList}>
						{allPermissions.map(permission => (
							<div key={permission} className={styles.permissionItem}>
								<label className={styles.checkboxLabel}>
									<input
										type='checkbox'
										checked={selectedPermissions.includes(permission)}
										onChange={() => handlePermissionToggle(permission)}
										className={styles.checkbox}
									/>
									<span className={styles.checkboxCustom}></span>
									<div className={styles.permissionInfo}>
										<span className={styles.permissionName}>
											{PermissionDisplayNames[permission]}
										</span>
									</div>
								</label>
							</div>
						))}
					</div>
				</div>

				<div className={styles.modalFooter}>
					<button
						className={styles.cancelButton}
						onClick={onClose}
						disabled={isLoading}
					>
						Отмена
					</button>
					<button
						className={styles.saveButton}
						onClick={handleSave}
						disabled={isLoading}
					>
						{isLoading ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default AdminPermissionsEdit
