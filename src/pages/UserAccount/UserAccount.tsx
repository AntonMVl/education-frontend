import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import styles from './UserAccount.module.scss'

const UserAccount: FC = () => {
	return (
		<section className={styles.userInfo}>
			<Link to='/' className={styles.userInfo__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.userInfo__buttonIcon}
				/>
			</Link>
			<h1 className={styles.userInfo__title}>Ваш личный кабинет</h1>
		</section>
	)
}
export default UserAccount
