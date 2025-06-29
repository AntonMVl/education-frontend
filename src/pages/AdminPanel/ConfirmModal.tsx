import React from 'react'
import styles from './ConfirmModal.module.scss'

interface ConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	message: string
	confirmText?: string
	cancelText?: string
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Удалить',
	cancelText = 'Отмена',
}) => {
	if (!isOpen) return null

	const handleConfirm = () => {
		onConfirm()
		onClose()
	}

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3>{title}</h3>
				</div>

				<div className={styles.modalBody}>
					<p>{message}</p>
				</div>

				<div className={styles.modalFooter}>
					<button type='button' onClick={onClose} className={styles.cancelBtn}>
						{cancelText}
					</button>
					<button
						type='button'
						onClick={handleConfirm}
						className={styles.confirmBtn}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmModal
