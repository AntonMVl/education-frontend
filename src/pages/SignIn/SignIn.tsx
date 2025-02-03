import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import { ISignInProps } from '../../types/api'
import styles from './signIn.module.scss'

const SignIn: FC<ISignInProps> = ({ login, errorMessage }) => {
	const [formData, setFormData] = useState({ login: '', password: '' })

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		login(formData.login, formData.password)
	}

	return (
		<section className={styles.signIn}>
			<Link to='/' className={styles.signIn__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.signIn__buttonIcon}
				/>
			</Link>
			<h1 className={styles.signIn__title}>Добро пожаловать!</h1>
			<form onSubmit={handleSubmit} noValidate className={styles.signIn__form}>
				<div className={styles.signIn__inputContainer}>
					<FormInput
						titleName='Логин'
						inputName='login'
						type='text'
						onChange={handleChange}
					/>
					<FormInput
						titleName='Пароль'
						inputName='password'
						type='password'
						onChange={handleChange}
					/>
				</div>
				{errorMessage && <p className={styles.signIn__error}>{errorMessage}</p>}
				<SignButton />
			</form>
		</section>
	)
}

export default SignIn
