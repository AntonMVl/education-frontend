import React, { useEffect, useState } from 'react'
import { cityNames, roleNames } from '../../constants/DropDownOptionValuse'
import { AdminUser, UpdateUserData } from '../../utils/adminApi'
import styles from './UserInfoModal.module.scss'

interface UserInfoModalProps {
	isOpen: boolean
	onClose: () => void
	user: AdminUser | null
	onSave: (userData: UpdateUserData) => Promise<void>
	canEdit: boolean
	startEditing?: boolean
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
	isOpen,
	onClose,
	user,
	onSave,
	canEdit,
	startEditing = false,
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState<UpdateUserData>({
		firstName: '',
		lastName: '',
		login: '',
		role: '',
		city: '',
	})
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				login: user.login,
				role: user.role,
				city: user.city,
			})
			setNewPassword('')
			setConfirmPassword('')
			setError('')
			setSuccess('')
			setIsEditing(startEditing)
		}
	}, [user, isOpen, startEditing])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSave = async () => {
		if (!user) return

		setLoading(true)
		setError('')
		setSuccess('')

		try {
			// Проверяем пароль если он введен
			if (newPassword) {
				if (newPassword !== confirmPassword) {
					setError('Пароли не совпадают')
					setLoading(false)
					return
				}
				if (newPassword.length < 6) {
					setError('Пароль должен содержать минимум 6 символов')
					setLoading(false)
					return
				}
				// Добавляем пароль к данным для обновления
				formData.password = newPassword
			}

			await onSave(formData)
			setSuccess('Данные пользователя успешно обновлены')
			setIsEditing(false)
			setNewPassword('')
			setConfirmPassword('')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка обновления пользователя')
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = () => {
		setIsEditing(true)
		setError('')
		setSuccess('')
	}

	const handleCancel = () => {
		setIsEditing(false)
		setNewPassword('')
		setConfirmPassword('')
		setError('')
		setSuccess('')
		// Восстанавливаем исходные данные
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				login: user.login,
				role: user.role,
				city: user.city,
			})
		}
	}

	if (!isOpen || !user) return null

	const getRoleLabel = (role: string) => {
		switch (role) {
			case 'admin':
				return 'Администратор'
			case 'superadmin':
				return 'Суперадминистратор'
			default:
				return 'Пользователь'
		}
	}

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3>Информация о пользователе</h3>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<div className={styles.modalBody}>
					{error && <div className={styles.error}>{error}</div>}
					{success && <div className={styles.success}>{success}</div>}

					<div className={styles.userInfo}>
						<div className={styles.infoRow}>
							<label>ID:</label>
							<span>{user.id}</span>
						</div>

						<div className={styles.infoRow}>
							<label>Имя:</label>
							<input
								type='text'
								name='firstName'
								value={formData.firstName}
								onChange={handleChange}
								required
								readOnly={!isEditing}
								disabled={!isEditing}
							/>
						</div>

						<div className={styles.infoRow}>
							<label>Фамилия:</label>
							<input
								type='text'
								name='lastName'
								value={formData.lastName}
								onChange={handleChange}
								required
								readOnly={!isEditing}
								disabled={!isEditing}
							/>
						</div>

						<div className={styles.infoRow}>
							<label>Логин:</label>
							<input
								type='text'
								name='login'
								value={formData.login}
								onChange={handleChange}
								required
								readOnly={!isEditing}
								disabled={!isEditing}
							/>
						</div>

						<div className={styles.infoRow}>
							<label>Роль:</label>
							{isEditing ? (
								<select
									name='role'
									value={formData.role}
									onChange={handleChange}
								>
									{roleNames.map(role => (
										<option key={role} value={role}>
											{role}
										</option>
									))}
								</select>
							) : (
								<input type='text' value={formData.role} readOnly disabled />
							)}
						</div>

						<div className={styles.infoRow}>
							<label>Город:</label>
							{isEditing ? (
								<select
									name='city'
									value={formData.city}
									onChange={handleChange}
									required
								>
									<option value=''>Выберите город</option>
									{cityNames.map(city => (
										<option key={city} value={city}>
											{city}
										</option>
									))}
								</select>
							) : (
								<input
									type='text'
									name='city'
									value={formData.city}
									onChange={handleChange}
									required
									readOnly={!isEditing}
									disabled={!isEditing}
								/>
							)}
						</div>

						{user.createdAt && (
							<div className={styles.infoRow}>
								<label>Дата регистрации:</label>
								<span>
									{new Date(user.createdAt).toLocaleDateString('ru-RU')}
								</span>
							</div>
						)}

						{isEditing && (
							<>
								<div className={styles.passwordSection}>
									<h4>Изменить пароль</h4>
									<div className={styles.infoRow}>
										<label>Новый пароль:</label>
										<input
											type='password'
											value={newPassword}
											onChange={e => setNewPassword(e.target.value)}
											placeholder='Оставьте пустым, чтобы не менять'
										/>
									</div>
									<div className={styles.infoRow}>
										<label>Подтвердите пароль:</label>
										<input
											type='password'
											value={confirmPassword}
											onChange={e => setConfirmPassword(e.target.value)}
											placeholder='Повторите новый пароль'
										/>
									</div>
								</div>
							</>
						)}
					</div>
				</div>

				<div className={styles.modalFooter}>
					{!isEditing ? (
						<>
							{canEdit && (
								<button className={styles.editBtn} onClick={handleEdit}>
									Редактировать
								</button>
							)}
							<button className={styles.closeBtn} onClick={onClose}>
								Закрыть
							</button>
						</>
					) : (
						<>
							<button
								className={styles.saveBtn}
								onClick={handleSave}
								disabled={loading}
							>
								{loading ? 'Сохранение...' : 'Сохранить'}
							</button>
							<button className={styles.cancelBtn} onClick={handleCancel}>
								Отмена
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default UserInfoModal
