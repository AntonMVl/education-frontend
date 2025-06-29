import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import passwordClose from '../../assets/passwordClose.png'
import passwordOpen from '../../assets/passwordOpen.png'
import PermissionErrorModal from '../../components/PermissionErrorModal/PermissionErrorModal'
import {
	cityNames,
	getRoleDisplayName,
	normalizeRoleValue,
	roleDisplayNames,
	roleNames,
} from '../../constants/DropDownOptionValuse'
import { usePermissions } from '../../hooks/usePermissions'
import { RootState } from '../../store/store'
import { Permission } from '../../types/permissions'
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
	const currentUser = useSelector((state: RootState) => state.user.user)
	const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false)
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

	// Модальное окно ошибки прав
	const [permissionError, setPermissionError] = useState<{
		isOpen: boolean
		action: string
	}>({
		isOpen: false,
		action: '',
	})

	const { hasPermission } = usePermissions()

	// Определяем доступные роли в зависимости от роли текущего пользователя
	const getAvailableRoles = () => {
		if (!currentUser) return ['user']

		const currentUserRole = currentUser.role?.toLowerCase()
		if (currentUserRole === 'superadmin') {
			return roleNames // Все роли доступны суперадмину
		} else if (currentUserRole === 'admin') {
			// Проверяем права на управление админами
			const hasManageAdminsPermission =
				currentUser.permissions?.includes('manage_admins')

			if (hasManageAdminsPermission) {
				return ['user', 'admin'] // Админ с правами может изменять на user и admin
			} else {
				return ['user'] // Админ без прав может изменять только на user
			}
		}
		return ['user']
	}

	const availableRoles = getAvailableRoles()

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
			setIsNewPasswordVisible(false)
			setIsConfirmPasswordVisible(false)
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

		// Проверяем права перед сохранением
		// Пользователь может редактировать свои данные по умолчанию
		const isEditingSelf = currentUser?.id === user?.id
		if (!isEditingSelf && !hasPermission(Permission.EDIT_USERS)) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать пользователей',
			})
			return
		}

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

		// Проверка паролей
		if (newPassword || confirmPassword) {
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
		}

		try {
			const updateData: UpdateUserData = {
				firstName: formData.firstName.trim(),
				lastName: formData.lastName.trim(),
				city: formData.city.trim(),
			}

			// Добавляем роль только если она изменилась и пользователь может её изменять
			// Админ не может изменять свою роль при редактировании своих данных
			if (formData.role && formData.role !== user?.role) {
				const isEditingSelf = currentUser?.id === user?.id
				const isAdminEditingSelf =
					isEditingSelf && currentUser?.role === 'admin'

				if (!isAdminEditingSelf) {
					updateData.role = formData.role
				}
			}

			// Добавляем пароль только если он указан
			if (newPassword) {
				updateData.password = newPassword
			}

			await onSave(updateData)
			setSuccess('Пользователь успешно обновлен')
			setIsEditing(false)
			setNewPassword('')
			setConfirmPassword('')

			// Скрываем сообщение об успехе через 3 секунды
			setTimeout(() => {
				setSuccess('')
			}, 3000)
		} catch (error: unknown) {
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
					setError('Ошибка обновления пользователя')
				}
			} else if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Ошибка обновления пользователя')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = () => {
		// Проверяем права перед переходом в режим редактирования
		// Пользователь может редактировать свои данные по умолчанию
		const isEditingSelf = currentUser?.id === user?.id
		if (!isEditingSelf && !hasPermission(Permission.EDIT_USERS)) {
			setPermissionError({
				isOpen: true,
				action: 'редактировать пользователей',
			})
			return
		}
		setIsEditing(true)
		setError('')
		setSuccess('')
	}

	const handleCancel = () => {
		setIsEditing(false)
		setNewPassword('')
		setConfirmPassword('')
		setIsNewPasswordVisible(false)
		setIsConfirmPasswordVisible(false)
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
		<>
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
									autoComplete='off'
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
									autoComplete='off'
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
									autoComplete='off'
								/>
							</div>

							<div className={styles.infoRow}>
								<label>Роль:</label>
								{isEditing ? (
									// Проверяем, может ли пользователь изменять роль
									// Админ не может изменять свою роль при редактировании своих данных
									currentUser?.id === user?.id &&
									currentUser?.role === 'admin' ? (
										<input
											type='text'
											value={getRoleDisplayName(formData.role || '')}
											readOnly
											disabled
										/>
									) : (
										<select
											name='role'
											value={formData.role}
											onChange={e =>
												handleChange({
													...e,
													target: {
														...e.target,
														value: normalizeRoleValue(e.target.value),
													},
												})
											}
										>
											{availableRoles.map(role => (
												<option key={role} value={role}>
													{
														roleDisplayNames[
															role as keyof typeof roleDisplayNames
														]
													}
												</option>
											))}
										</select>
									)
								) : (
									<input
										type='text'
										value={getRoleDisplayName(formData.role || '')}
										readOnly
										disabled
									/>
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
											<div className={styles.passwordInputWrapper}>
												<input
													type={isNewPasswordVisible ? 'text' : 'password'}
													value={newPassword}
													onChange={e => setNewPassword(e.target.value)}
													placeholder='Оставьте пустым, чтобы не менять'
													autoComplete='off'
												/>
												<button
													type='button'
													className={styles.passwordToggle}
													onClick={() =>
														setIsNewPasswordVisible(!isNewPasswordVisible)
													}
												>
													<img
														src={
															isNewPasswordVisible
																? passwordOpen
																: passwordClose
														}
														alt='Показать/скрыть пароль'
														className={styles.passwordToggleIcon}
													/>
												</button>
											</div>
										</div>
										<div className={styles.infoRow}>
											<label>Подтвердите пароль:</label>
											<div className={styles.passwordInputWrapper}>
												<input
													type={isConfirmPasswordVisible ? 'text' : 'password'}
													value={confirmPassword}
													onChange={e => setConfirmPassword(e.target.value)}
													placeholder='Повторите новый пароль'
													autoComplete='off'
												/>
												<button
													type='button'
													className={styles.passwordToggle}
													onClick={() =>
														setIsConfirmPasswordVisible(
															!isConfirmPasswordVisible
														)
													}
												>
													<img
														src={
															isConfirmPasswordVisible
																? passwordOpen
																: passwordClose
														}
														alt='Показать/скрыть пароль'
														className={styles.passwordToggleIcon}
													/>
												</button>
											</div>
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
								<button className={styles.cancelBtn} onClick={onClose}>
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

			{/* Модальное окно ошибки прав */}
			<PermissionErrorModal
				isOpen={permissionError.isOpen}
				onClose={() => setPermissionError({ isOpen: false, action: '' })}
				action={permissionError.action}
			/>
		</>
	)
}

export default UserInfoModal
