import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import FormInput from '../../components/FormInput/FormInput'
import styles from './SignIn.module.scss'

const SignIn: FC = () => {
	return (
		<section className={styles.SignIn}>
			<Link to='/' className={styles.SignIn__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.SignIn__buttonIcon}
				/>
			</Link>
			<h1 className={styles.SignUp__title}>Добро пожаловать!</h1>
			<form action='post' noValidate>
				<div className={styles.signIn__inputContainer}>
					<FormInput titleName='Логин' inputName='login' />
					<FormInput titleName='Пароль' inputName='password' />
				</div>
			</form>
		</section>
	)
}

export default SignIn
