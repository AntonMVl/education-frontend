import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import Dropdown from '../../components/DropDown/DropDown'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import { cityNames, roleNames } from '../../constants/DropDownOptionValuse'
import { ISignUpProps } from '../../types/api'

import styles from './SignUp.module.scss'

const SignUp: FC<ISignUpProps> = ({ registration }) => {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		login: '',
		role: roleNames[0], // ✅ По умолчанию ставим первую роль
		city: cityNames[0], // ✅ По умолчанию ставим первый город
	})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData(prevState => ({ ...prevState, [name]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Проверяем, выбрал ли пользователь роль и город
		if (!formData.role || !formData.city) {
			console.error('Выберите роль и город')
			return
		}

		console.log('Отправка формы:', formData)
		registration(formData)
	}

	return (
		<section className={styles.signUp}>
			<Link to='/' className={styles.signUp__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.signUp__buttonIcon}
				/>
			</Link>
			<h1 className={styles.SignUp__title}>Регистрация пользователя</h1>
			<form onSubmit={handleSubmit} noValidate className={styles.signUp__form}>
				<div className={styles.signUp__inputContainer}>
					<FormInput
						titleName='Имя:'
						inputName='firstName'
						type='text'
						onChange={handleChange}
					/>
					<FormInput
						titleName='Фамилия:'
						inputName='lastName'
						type='text'
						onChange={handleChange}
					/>
					<FormInput
						titleName='Login:'
						inputName='login'
						type='text'
						onChange={handleChange}
					/>
				</div>
				<div className={styles.signUp__inputContainer}>
					<Dropdown
						name='role'
						options={roleNames}
						defaultValue={formData.role}
						onChange={handleChange}
					/>
					<Dropdown
						name='city'
						options={cityNames}
						defaultValue={formData.city}
						onChange={handleChange}
					/>
				</div>
				<SignButton buttonText='Регистрация' type='submit' />
			</form>
		</section>
	)
}

export default SignUp
