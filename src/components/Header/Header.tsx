import { FC } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import { RootState } from '../../store/store'
import { IHeaderProps } from '../../types/HeaderTypes'
import styles from './header.module.scss'

export const Header: FC<IHeaderProps> = ({ loggedIn, signOut }) => {
	const user = useSelector((state: RootState) => state.user.user)

	// Проверяем, является ли пользователь администратором или суперадминистратором
	const isAdmin =
		user?.role?.toLowerCase() === 'admin' ||
		user?.role?.toLowerCase() === 'superadmin'

	return (
		<section className={styles.header}>
			<div className={styles.header__leftSection}>
				<Link to='/' className={styles.header__button}>
					<img
						src={mainIcon}
						alt='main-icon'
						className={styles.header__buttonIcon}
					/>
				</Link>
				{loggedIn && user && (
					<span className={styles.header__userName}>
						{user.firstName} {user.lastName}
					</span>
				)}
			</div>
			<div className={styles.header__linksContainer}>
				{loggedIn ? (
					<>
						<Link className={styles.header__link} to='/profile'>
							Личный кабинет
						</Link>
						{isAdmin && (
							<Link className={styles.header__link} to='/admin'>
								Админ панель
							</Link>
						)}
						<button className={styles.header__buttonLink} onClick={signOut}>
							Выйти
						</button>
					</>
				) : (
					<>
						<Link className={styles.header__link} to='/signin'>
							Вход
						</Link>
						<Link className={styles.header__link} to='/signup'>
							Регистрация
						</Link>
					</>
				)}
			</div>
		</section>
	)
}
