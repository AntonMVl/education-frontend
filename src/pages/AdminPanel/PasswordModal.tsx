import React from 'react'
import styles from './PasswordModal.module.scss'

interface PasswordModalProps {
	isOpen: boolean
	onClose: () => void
	plainPassword: string
	userLogin: string
}

const PasswordModal: React.FC<PasswordModalProps> = ({
	isOpen,
	onClose,
	plainPassword,
	userLogin,
}) => {
	if (!isOpen) return null

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3>Пользователь успешно создан!</h3>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<div className={styles.modalBody}>
					<div className={styles.infoSection}>
						<h4>Данные для входа:</h4>
						<div className={styles.infoRow}>
							<label>Логин:</label>
							<span className={styles.value}>{userLogin}</span>
						</div>
						<div className={styles.infoRow}>
							<label>Временный пароль:</label>
							<span className={styles.password}>{plainPassword}</span>
						</div>
					</div>

					<div className={styles.instructions}>
						<p>
							<strong>Важно!</strong> Передайте эти данные пользователю для
							первого входа в систему.
						</p>
						<p>
							После первого входа пользователь сможет изменить пароль в личном
							кабинете.
						</p>
					</div>
				</div>

				<div className={styles.modalFooter}>
					<button className={styles.okBtn} onClick={onClose}>
						Понятно
					</button>
				</div>
			</div>
		</div>
	)
}

export default PasswordModal
