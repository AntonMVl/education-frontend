import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import styles from './SignIn.module.scss'

const SignIn: FC = () => {
	const [inputStates, setInputStates] = useState<
		Record<string, { hasText: boolean; touched: boolean }>
	>({})

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setInputStates(prevState => ({
			...prevState,
			[name]: {
				...prevState[name],
				hasText: value.trim().length > 0,
			},
		}))
	}

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		const { name } = event.target
		setInputStates(prevState => ({
			...prevState,
			[name]: {
				...prevState[name],
				touched: true,
			},
		}))
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
			<form action='post' noValidate className={styles.signIn__form}>
				<fieldset className={styles.signIn__formContainer}>
					<p className={styles.signIn__formTitle}>Имя:</p>
					<input
						type='text'
						name='firstName'
						id='firstName'
						className={`${styles.signIn__formInput} ${
							inputStates.firstName?.hasText
								? styles.signIn__formInput_type_active
								: ''
						}`}
						onChange={handleInputChange}
						onBlur={handleBlur}
						autoComplete='off'
						required
						minLength={2}
						maxLength={30}
					/>
					<span
						className={`${styles.signIn__inputError} ${
							inputStates.firstName?.touched && !inputStates.firstName?.hasText
								? styles.signIn__inputError_type_active
								: ''
						}`}
					>
						Поле обязательно для заполнения
					</span>
				</fieldset>
				<fieldset className={styles.signIn__formContainer}>
					<p className={styles.signIn__formTitle}>Фамилия:</p>
					<input
						type='text'
						name='lastName'
						id='lastName'
						className={`${styles.signIn__formInput} ${
							inputStates.lastName?.hasText
								? styles.signIn__formInput_type_active
								: ''
						}`}
						onChange={handleInputChange}
						onBlur={handleBlur}
						autoComplete='off'
						required
						minLength={2}
						maxLength={30}
					/>
					<span
						className={`${styles.signIn__inputError} ${
							inputStates.lastName?.touched && !inputStates.lastName?.hasText
								? styles.signIn__inputError_type_active
								: ''
						}`}
					>
						Поле обязательно для заполнения
					</span>
				</fieldset>
			</form>
		</section>
	)
}

export default SignIn
