import React from 'react'
import styles from './PermissionErrorModal.module.scss'

interface PermissionErrorModalProps {
	isOpen: boolean
	onClose: () => void
	action?: string
}

const PermissionErrorModal: React.FC<PermissionErrorModalProps> = ({
	isOpen,
	onClose,
	action = 'выполнить это действие',
}) => {
	if (!isOpen) return null

	return (
		<div className={styles.modal}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2>Упс, у вас нет прав</h2>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>

				<div className={styles.modalBody}>
					<div className={styles.errorIcon}>⚠️</div>
					<p className={styles.errorMessage}>
						У вас нет необходимых прав для того, чтобы {action}.
					</p>
					<p className={styles.helpText}>
						Обратитесь к суперадминистратору для получения соответствующих прав
						доступа.
					</p>
				</div>

				<div className={styles.modalFooter}>
					<button className={styles.closeModalButton} onClick={onClose}>
						Понятно
					</button>
				</div>
			</div>
		</div>
	)
}

export default PermissionErrorModal
