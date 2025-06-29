import React from 'react'
import { AdminPermissionsResponse } from '../../types/permissions'
import styles from './AdminPermissionsInfo.module.scss'

interface AdminPermissionsInfoProps {
	data: AdminPermissionsResponse
	onClose: () => void
}

const AdminPermissionsInfo: React.FC<AdminPermissionsInfoProps> = ({
	data,
	onClose,
}) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<div className={styles.modal}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2>Права администратора</h2>
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
					<h3>Предоставленные права:</h3>
					{data.permissions.length > 0 ? (
						<div className={styles.permissionsList}>
							{data.permissions.map((permission, index) => (
								<div key={index} className={styles.permissionItem}>
									<div className={styles.permissionName}>
										{permission.displayName}
									</div>
									<div className={styles.permissionDetails}>
										<span className={styles.grantedAt}>
											Предоставлено: {formatDate(permission.grantedAt)}
										</span>
										{permission.grantedBy && (
											<span className={styles.grantedBy}>
												Суперадмином: {permission.grantedBy.firstName}{' '}
												{permission.grantedBy.lastName}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className={styles.noPermissions}>
							Администратору не предоставлено никаких прав
						</p>
					)}
				</div>

				<div className={styles.modalFooter}>
					<button className={styles.closeModalButton} onClick={onClose}>
						Закрыть
					</button>
				</div>
			</div>
		</div>
	)
}

export default AdminPermissionsInfo
