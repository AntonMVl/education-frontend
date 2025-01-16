import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import styles from './signIn.module.scss'

const signIn: FC = () => {
	return (
		<section className={styles.signIn}>
			<Link to='/' className={styles.signIn__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.signIn__buttonIcon}
				/>
			</Link>
			<h1 className={styles.SignUp__title}>Добро пожаловать!</h1>
			<form action='post' noValidate className={styles.signIn__form}>
				<div className={styles.signIn__inputContainer}>
					<FormInput titleName='Логин' inputName='login' type='text' />
					<FormInput titleName='Пароль' inputName='password' type='password' />
				</div>
				<SignButton />
			</form>
		</section>
	)
}

export default signIn
