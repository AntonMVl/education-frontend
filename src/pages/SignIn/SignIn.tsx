import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import styles from './SignIn.module.scss'

const SignIn: FC = () => {
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
		</section>
	)
}

export default SignIn
