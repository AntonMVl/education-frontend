import { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import ChangePasswordInput from '../../components/ChangePassworInput/ChangePasswordInput'
import Dropdown from '../../components/DropDown/DropDown'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import { cityNames } from '../../constants/DropDownOptionValuse'
import { RootState } from '../../store/store'
import { setUser } from '../../store/userSlice'
import mainApi from '../../utils/authApi'
import styles from './UserAccount.module.scss'

const UserAccount: FC = () => {
	const dispatch = useDispatch()
	const currentUser = useSelector((state: RootState) => state.user.user)
	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [formData, setFormData] = useState<Record<string, string | number>>({})
	const [originalData, setOriginalData] = useState<
		Record<string, string | number>
	>({})
	const [isChanged, setIsChanged] = useState(false)
	const [loading, setLoading] = useState(false)
	const [passwords, setPasswords] = useState({
		newPassword: '',
		confirmNewPassword: '',
	})
	const [passwordError, setPasswordError] = useState('')

	useEffect(() => {
		if (currentUser) {
			const userData = { ...currentUser }
			setFormData(userData)
			setOriginalData(userData)
		}
	}, [currentUser])

	useEffect(() => {
		const hasFormChanges =
			JSON.stringify(formData) !== JSON.stringify(originalData)
		const hasPasswordChanges =
			passwords.newPassword !== '' || passwords.confirmNewPassword !== ''
		setIsChanged(hasFormChanges || hasPasswordChanges)
	}, [formData, originalData, passwords])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		if (name === 'newPassword' || name === 'confirmNewPassword') {
			setPasswords(prev => ({ ...prev, [name]: value }))
			setPasswordError('')
		} else {
			setFormData(prev => ({ ...prev, [name]: value }))
		}
	}

	const handleDropdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, city: e.target.value }))
	}

	const handleEdit = () => {
		setIsEditing(true)
		setPasswordError('')
		setPasswords({ newPassword: '', confirmNewPassword: '' })
	}
	const handleCancel = () => {
		setFormData({ ...originalData })
		setIsEditing(false)
		setPasswordError('')
		setPasswords({ newPassword: '', confirmNewPassword: '' })
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setPasswordError('')
		if (!isChanged && !passwords.newPassword) return
		setLoading(true)

		// Проверка совпадения новых паролей
		if (passwords.newPassword || passwords.confirmNewPassword) {
			if (passwords.newPassword !== passwords.confirmNewPassword) {
				setPasswordError('Пароли не совпадают')
				setLoading(false)
				return
			}
		}

		// Собираем только изменённые поля
		const changedFields: Record<string, string> = {}
		Object.keys(formData).forEach(key => {
			if (formData[key] !== originalData[key]) {
				changedFields[key] = String(formData[key])
			}
		})
		// Если меняется пароль — добавляем его в changedFields
		if (passwords.newPassword) {
			changedFields.password = passwords.newPassword
		}

		try {
			const token = localStorage.getItem('jwt')
			if (!token) throw new Error('Нет токена')
			const response = await mainApi.updateUser(changedFields, token)
			if (response.token) {
				localStorage.setItem('jwt', response.token)
			}
			const updatedUser = response.user || response
			setOriginalData(updatedUser)
			setFormData(updatedUser)
			dispatch(setUser(updatedUser))
			setIsEditing(false)
			setPasswords({ newPassword: '', confirmNewPassword: '' })
		} catch (e) {
			setPasswordError('Ошибка обновления профиля')
			console.error('Ошибка обновления профиля:', e)
		} finally {
			setLoading(false)
		}
	}

	if (!currentUser) return <div>Загрузка...</div>

	return (
		<section className={styles.profile}>
			<Link to='/' className={styles.profile__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.profile__buttonIcon}
				/>
			</Link>
			<h1 className={styles.profile__title}>Ваш личный кабинет</h1>
			<form noValidate className={styles.profile__form} onSubmit={handleSubmit}>
				<div className={styles.profile__inputContainer}>
					<FormInput
						titleName='Имя:'
						inputName='firstName'
						type='text'
						value={String(formData.firstName || '')}
						onChange={handleChange}
						disabled={!isEditing}
					/>
					<FormInput
						titleName='Фамилия:'
						inputName='lastName'
						type='text'
						value={String(formData.lastName || '')}
						onChange={handleChange}
						disabled={!isEditing}
					/>
					<FormInput
						titleName='Login:'
						inputName='login'
						type='text'
						value={String(formData.login || '')}
						onChange={handleChange}
						disabled={!isEditing}
					/>
				</div>
				<div className={styles.profile__inputContainer}>
					<Dropdown
						name='Город:'
						options={cityNames}
						value={String(formData.city || '')}
						disabled={!isEditing}
						onChange={handleDropdownChange}
					/>
				</div>
				{isEditing && (
					<div className={styles.profile__inputContainer}>
						<ChangePasswordInput
							onChange={handleChange}
							disabled={!isEditing}
						/>
						{passwordError && (
							<div style={{ color: 'red', marginTop: 8 }}>{passwordError}</div>
						)}
					</div>
				)}
				<div className={styles.profile__inputContainer}>
					{isEditing ? (
						<>
							<SignButton
								buttonText='Сохранить'
								type='submit'
								disabled={!isChanged || loading}
							/>
							<SignButton
								buttonText='Назад'
								type='button'
								onClick={handleCancel}
							/>
						</>
					) : (
						<>
							<SignButton
								buttonText='Редактировать'
								type='button'
								onClick={handleEdit}
							/>
							<Link to={'/courses'} className={styles.profile__buttonLink}>
								К обучению
							</Link>
						</>
					)}
				</div>
			</form>
		</section>
	)
}
export default UserAccount
