import React, { useEffect, useState } from 'react'
import {
	cityNames,
	roleDisplayNames,
	roleNames,
} from '../../constants/DropDownOptionValuse'
import { AdminUser, CreateUserData, UpdateUserData } from '../../utils/adminApi'
import styles from './UserModal.module.scss'

interface UserModalProps {
	isOpen: boolean
	onClose: () => void
	user?: AdminUser | null
	onSave: (userData: CreateUserData | UpdateUserData) => Promise<void>
}

const UserModal: React.FC<UserModalProps> = ({
	isOpen,
	onClose,
	user,
	onSave,
}) => {
	const [formData, setFormData] = useState<CreateUserData>({
		firstName: '',
		lastName: '',
		login: '',
		role: 'user',
		city: '',
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				login: user.login,
				role: user.role,
				city: user.city,
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
		setError('')
	}, [user, isOpen])

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
		if (!formData.firstName.trim()) {
			setError('Имя обязательно для заполнения')
			setLoading(false)
			return
		}

		if (!formData.lastName.trim()) {
			setError('Фамилия обязательна для заполнения')
			setLoading(false)
			return
		}

		if (!formData.login.trim()) {
			setError('Логин обязателен для заполнения')
			setLoading(false)
			return
		}

		if (formData.login.trim().length < 3) {
			setError('Логин должен содержать минимум 3 символа')
			setLoading(false)
			return
		}

		if (!formData.city.trim()) {
			setError('Город обязателен для заполнения')
			setLoading(false)
			return
		}

		try {
			// Убираем лишние пробелы
			const cleanData = {
				...formData,
				firstName: formData.firstName.trim(),
				lastName: formData.lastName.trim(),
				login: formData.login.trim(),
				city: formData.city.trim(),
			}

			await onSave(cleanData)
			onClose()
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

	if (!isOpen) return null

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3>
						{user ? 'Редактировать пользователя' : 'Создать пользователя'}
					</h3>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.formGroup}>
						<label>Имя:</label>
						<input
							type='text'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Фамилия:</label>
						<input
							type='text'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Логин:</label>
						<input
							type='text'
							name='login'
							value={formData.login}
							onChange={handleChange}
							required
							minLength={3}
							pattern='.{3,}'
							title='Логин должен содержать минимум 3 символа'
							disabled={!!user} // логин нельзя менять при редактировании
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Роль:</label>
						<select name='role' value={formData.role} onChange={handleChange}>
							{roleNames.map(role => (
								<option key={role} value={role}>
									{roleDisplayNames[role]}
								</option>
							))}
						</select>
					</div>

					<div className={styles.formGroup}>
						<label>Город:</label>
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
					</div>

					<div className={styles.modalFooter}>
						<button
							type='button'
							onClick={onClose}
							className={styles.cancelBtn}
						>
							Отмена
						</button>
						<button type='submit' className={styles.saveBtn} disabled={loading}>
							{loading ? 'Сохранение...' : 'Сохранить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default UserModal
