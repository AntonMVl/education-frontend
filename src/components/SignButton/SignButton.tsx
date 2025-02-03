import { FC } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './SignButton.module.scss'

const SignButton: FC = () => {
	const location = useLocation()

	const buttonText = location.pathname === '/signin' ? 'Вход' : 'Регистрация'
	return (
		<button className={styles.sign__button} type='submit'>
			{buttonText}
		</button>
	)
}

export default SignButton
