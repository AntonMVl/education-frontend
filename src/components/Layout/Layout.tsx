import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { ILayoutProps } from '../../types/layoutTypes'
import { Footer } from '../Footer/Footer'
import { Header } from '../Header/Header'
import styles from './Layout.module.scss'

const Layout: FC<ILayoutProps> = ({ loggedIn, signOut }) => {
	return (
		<div className={styles.layout}>
			<Header loggedIn={loggedIn} signOut={signOut} />
			<main className={styles.main}>
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}

export default Layout
