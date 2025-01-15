import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import Dropdown from '../../components/DropDown/DropDown'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import { cityNames, roleNames } from '../../constants/DropDownOptionValuse'
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
			<h1 className={styles.SignUp__title}>Регистрация пользователя </h1>
			<form action='post' noValidate className={styles.SignUp__form}>
				<div className={styles.signUp__inputContainer}>
					<FormInput titleName='Имя:' inputName='firstName' />
					<FormInput titleName='Фамилия:' inputName='lastName' />
					<FormInput titleName='Login:' inputName='login' />
				</div>
				<div className={styles.signUp__inputContainer}>
					<Dropdown name='Роль' options={roleNames} />
					<Dropdown name='Город (район)' options={cityNames} />
				</div>
				<SignButton />
			</form>
		</section>
	)
}

export default SignUp
