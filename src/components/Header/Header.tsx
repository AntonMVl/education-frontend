import { FC } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import styles from './header.module.scss'

export const Header: FC = () => {
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
				<Link className={styles.header__link} to='/signin'>
					Вход
				</Link>
				<Link className={styles.header__link} to='/signup'>
					Регистрация
				</Link>
			</div>
		</section>
	)
}
