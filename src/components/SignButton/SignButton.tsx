import { FC } from 'react'
import styles from './SignButton.module.scss'

const SignButton: FC = () => {
	return (
		<button className={styles.sign__button} type='submit'>
			Регистрация
		</button>
	)
}

export default SignButton
