import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import passwordClose from '../../assets/passwordClose.png'
import passwordOpen from '../../assets/passwordOpen.png'
import { cityNames } from '../../constants/DropDownOptionValuse'
import usePasswordVisibility from '../../hooks/usePasswordVisibility'
import { RootState } from '../../store/store'
import adminApi, { AdminUser } from '../../utils/adminApi'
import styles from './UserModal.module.scss'

interface UserModalProps {
	isOpen: boolean
	onClose: () => void
	user?: AdminUser | null
	onSuccess: () => void
}

const roleOptions = [
	{ value: 'user', label: 'Пользователь' },
	{ value: 'admin', label: 'Администратор' },
	{ value: 'superadmin', label: 'Суперадминистратор' },
]

const UserModal: React.FC<UserModalProps> = ({
	isOpen,
	onClose,
	user,
	onSuccess,
}) => {
	const currentUser = useSelector((state: RootState) => state.user.user)
	const { isPasswordVisible, togglePasswordVisibility } =
		usePasswordVisibility()
	const [loading, setLoading] = useState(false)
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [generatedPassword, setGeneratedPassword] = useState('')
	const [formData, setFormData] = useState<{
		firstName: string
		lastName: string
		login: string
		role: string
		city: string
		password?: string
	}>({
		firstName: '',
		lastName: '',
		login: '',
		role: 'user',
		city: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	// Определяем доступные роли в зависимости от прав текущего пользователя
	const getAvailableRoles = () => {
		if (!currentUser) return roleOptions

		if (currentUser.role === 'superadmin') {
			return roleOptions // Суперадмин может создавать всех
		}

		if (currentUser.role === 'admin') {
			const hasManageAdminsPermission =
				currentUser.permissions?.includes('manage_admins')

			if (hasManageAdminsPermission) {
				return [
					{ value: 'user', label: 'Пользователь' },
					{ value: 'admin', label: 'Администратор' },
				]
			} else {
				return [{ value: 'user', label: 'Пользователь' }]
			}
		}

		return []
	}

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				login: user.login || '',
				role: user.role || 'user',
				city: user.city || '',
				password: '',
			})
		} else {
			setFormData({
				firstName: '',
				lastName: '',
				login: '',
				role: 'user',
				city: '',
			})
		}
		setErrors({})
	}, [user, isOpen])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
		// Очищаем ошибку для этого поля
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: '' }))
		}
	}

	const validateForm = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'Имя обязательно'
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Фамилия обязательна'
		}

		if (!formData.login.trim()) {
			newErrors.login = 'Логин обязателен'
		}

		if (!formData.role) {
			newErrors.role = 'Роль обязательна'
		}

		if (!formData.city.trim()) {
			newErrors.city = 'Город обязателен'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setLoading(true)
		try {
			if (user) {
				// Обновление пользователя
				const { password, ...updateData } = formData
				const finalUpdateData: Partial<typeof formData> = { ...updateData }
				if (password) {
					finalUpdateData.password = password
				}
				await adminApi.updateUser(user.id, finalUpdateData)
				alert('Пользователь успешно обновлен')
				onSuccess()
				onClose()
			} else {
				// Создание пользователя
				const createData = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					login: formData.login,
					role: formData.role,
					city: formData.city,
				}
				const result = await adminApi.createUser(createData)
				setGeneratedPassword(result.plainPassword)
				setShowPasswordModal(true)
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Произошла ошибка'
			alert(`Ошибка: ${errorMessage}`)
		} finally {
			setLoading(false)
		}
	}

	const availableRoles = getAvailableRoles()

	if (!isOpen) return null

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>
						{user ? 'Редактировать пользователя' : 'Создать пользователя'}
					</h2>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label htmlFor='firstName'>Имя *</label>
						<input
							type='text'
							id='firstName'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							className={errors.firstName ? styles.error : ''}
							autoComplete='off'
						/>
						{errors.firstName && (
							<span className={styles.errorText}>{errors.firstName}</span>
						)}
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='lastName'>Фамилия *</label>
						<input
							type='text'
							id='lastName'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							className={errors.lastName ? styles.error : ''}
							autoComplete='off'
						/>
						{errors.lastName && (
							<span className={styles.errorText}>{errors.lastName}</span>
						)}
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='login'>Логин *</label>
						<input
							type='text'
							id='login'
							name='login'
							value={formData.login}
							onChange={handleChange}
							className={errors.login ? styles.error : ''}
							autoComplete='off'
						/>
						{errors.login && (
							<span className={styles.errorText}>{errors.login}</span>
						)}
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='role'>Роль *</label>
						<select
							id='role'
							name='role'
							value={formData.role}
							onChange={handleChange}
							className={errors.role ? styles.error : ''}
						>
							{availableRoles.map(role => (
								<option key={role.value} value={role.value}>
									{role.label}
								</option>
							))}
						</select>
						{errors.role && (
							<span className={styles.errorText}>{errors.role}</span>
						)}
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='city'>Город *</label>
						<select
							id='city'
							name='city'
							value={formData.city}
							onChange={handleChange}
							className={errors.city ? styles.error : ''}
						>
							<option value=''>Выберите город</option>
							{cityNames.map(city => (
								<option key={city} value={city}>
									{city}
								</option>
							))}
						</select>
						{errors.city && (
							<span className={styles.errorText}>{errors.city}</span>
						)}
					</div>

					{user && (
						<div className={styles.formGroup}>
							<label htmlFor='password'>
								Новый пароль (оставьте пустым, чтобы не изменять)
							</label>
							<div className={styles.passwordInputWrapper}>
								<input
									type={isPasswordVisible ? 'text' : 'password'}
									id='password'
									name='password'
									value={formData.password}
									onChange={handleChange}
									autoComplete='off'
								/>
								<button
									type='button'
									className={styles.passwordToggle}
									onClick={togglePasswordVisibility}
								>
									<img
										src={isPasswordVisible ? passwordOpen : passwordClose}
										alt='Показать/скрыть пароль'
										className={styles.passwordToggleIcon}
									/>
								</button>
							</div>
						</div>
					)}

					<div className={styles.formActions}>
						<button
							type='button'
							onClick={onClose}
							className={styles.cancelButton}
						>
							Отмена
						</button>
						<button
							type='submit'
							disabled={loading}
							className={styles.submitButton}
						>
							{loading ? 'Сохранение...' : user ? 'Сохранить' : 'Создать'}
						</button>
					</div>
				</form>
			</div>

			{/* Модальное окно с сгенерированным паролем */}
			{showPasswordModal && (
				<div
					className={styles.modalOverlay}
					onClick={() => setShowPasswordModal(false)}
				>
					<div className={styles.modal} onClick={e => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h2>Пользователь успешно создан</h2>
							<button
								className={styles.closeButton}
								onClick={() => {
									setShowPasswordModal(false)
									onSuccess()
									onClose()
								}}
							>
								×
							</button>
						</div>
						<div className={styles.modalContent}>
							<p>Временный пароль для входа:</p>
							<div className={styles.passwordDisplay}>
								<strong>{generatedPassword}</strong>
							</div>
							<p className={styles.passwordNote}>
								Передайте этот пароль пользователю. Рекомендуется сменить пароль
								при первом входе в личном кабинете.
							</p>
						</div>
						<div className={styles.formActions}>
							<button
								type='button'
								onClick={() => {
									setShowPasswordModal(false)
									onSuccess()
									onClose()
								}}
								className={styles.submitButton}
							>
								Закрыть
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default UserModal
