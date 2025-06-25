import React, { useEffect, useState } from 'react'
import {
	cityNames,
	roleDisplayNames,
	roleNames,
} from '../../constants/DropDownOptionValuse'
import { AdminUser, UpdateUserData } from '../../utils/adminApi'
import styles from './UserInfoModal.module.scss'

interface UserInfoModalProps {
	isOpen: boolean
	onClose: () => void
	user: AdminUser | null
	onSave: (userData: UpdateUserData) => Promise<AdminUser>
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		// Валидация на фронтенде
		if (!formData.firstName?.trim()) {
			setError('Имя обязательно для заполнения')
			setLoading(false)
			return
		}

		if (!formData.lastName?.trim()) {
			setError('Фамилия обязательна для заполнения')
			setLoading(false)
			return
		}

		if (!formData.city?.trim()) {
			setError('Город обязателен для заполнения')
			setLoading(false)
			return
		}

		try {
			// Убираем лишние пробелы
			const cleanData = {
				...formData,
				firstName: formData.firstName?.trim() || '',
				lastName: formData.lastName?.trim() || '',
				city: formData.city?.trim() || '',
			}

			const updatedUser = await onSave(cleanData)
			setIsEditing(false)

			// Обновляем состояние формы с данными от сервера
			setFormData({
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				login: updatedUser.login,
				role: updatedUser.role,
				city: updatedUser.city,
			})
		} catch (error: unknown) {
			// Улучшенная обработка ошибок
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: { data?: { message?: string | string[] } }
				}
				if (axiosError.response?.data?.message) {
					if (Array.isArray(axiosError.response.data.message)) {
						setError(axiosError.response.data.message.join(', '))
					} else {
						setError(axiosError.response.data.message)
					}
				} else {
					setError('Ошибка сохранения пользователя')
				}
			} else if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Ошибка сохранения пользователя')
			}
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
		// Закрываем модальное окно
		onClose()
	}

	if (!isOpen || !user) return null

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
											{roleDisplayNames[role]}
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

						{user.creator && (
							<div className={styles.infoRow}>
								<label>Создан пользователем:</label>
								<span>
									{user.creator.firstName} {user.creator.lastName} (
									{user.creator.login})
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
								onClick={handleSubmit}
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
