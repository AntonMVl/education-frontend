import { FC } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import { RootState } from '../../store/store'
import { IHeaderProps } from '../../types/HeaderTypes'
import styles from './header.module.scss'

export const Header: FC<IHeaderProps> = ({ loggedIn, signOut }) => {
	const currentUser = useSelector((state: RootState) => state.user.user)
	const isAdmin =
		currentUser &&
		(currentUser.role?.toLowerCase() === 'admin' ||
			currentUser.role?.toLowerCase() === 'superadmin')
	return (
		<section className={styles.header}>
			<Link to='/' className={styles.header__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.header__buttonIcon}
				/>
			</Link>
			<div className={styles.header__linksContainer}>
				{loggedIn ? (
					<>
						<Link className={styles.header__link} to='/profile'>
							Личный кабинет
						</Link>
						{isAdmin && (
							<Link className={styles.header__link} to='/admin'>
								Админка
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
