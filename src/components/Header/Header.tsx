import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import styles from './header.module.scss'

export default function Header() {
	return (
		<section className={styles.header}>
			<Link to='#' className={styles.header__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.header__buttonIcon}
				/>
			</Link>
			<div className={styles.header__linksContainer}>
				<Link className={styles.header__link} to='#'>
					Вход
				</Link>
				<Link className={styles.header__link} to='#'>
					Регистрация
				</Link>
			</div>
		</section>
	)
}
