import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import FormInput from '../../components/FormInput/FormInput'
import styles from './SignUp.module.scss'

const SignUp: FC = () => {
	return (
		<section className={styles.SignUp}>
			<Link to='/' className={styles.SignUp__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.SignUp__buttonIcon}
				/>
			</Link>
			<h1 className={styles.SignUp__title}>Добро пожаловать!</h1>
			<form action='post' noValidate className={styles.SignUp__form}>
				<FormInput titleName='Имя:' inputName='firstName' />
				<FormInput titleName='Фамилия:' inputName='lastName' />
				<FormInput titleName='Логин:' inputName='login' />
			</form>
		</section>
	)
}

export default SignUp
