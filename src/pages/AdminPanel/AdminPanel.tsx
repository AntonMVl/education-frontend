import React from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import styles from './AdminPanel.module.scss'
import AdminsPage from './AdminsPage'
import AdminStats from './AdminStats'
import LecturesPage from './LecturesPage'
import UsersPage from './UsersPage'

const AdminPanel: React.FC = () => {
	const location = useLocation()

	const isActiveLink = (path: string) => {
		return location.pathname === path
	}

	return (
		<div className={styles.adminPanel}>
			<div className={styles.sidebar}>
				<div className={styles.sidebarHeader}>
					<h2>Админ панель</h2>
				</div>

				<nav className={styles.navigation}>
					<Link
						to='/admin'
						className={`${styles.navLink} ${
							isActiveLink('/admin') ? styles.active : ''
						}`}
					>
						Статистика
					</Link>

					<Link
						to='/admin/users'
						className={`${styles.navLink} ${
							isActiveLink('/admin/users') ? styles.active : ''
						}`}
					>
						Пользователи
					</Link>

					<Link
						to='/admin/admins'
						className={`${styles.navLink} ${
							isActiveLink('/admin/admins') ? styles.active : ''
						}`}
					>
						Администраторы
					</Link>

					<Link
						to='/admin/lectures'
						className={`${styles.navLink} ${
							isActiveLink('/admin/lectures') ? styles.active : ''
						}`}
					>
						Лекции
					</Link>
				</nav>
			</div>

			<div className={styles.content}>
				<Routes>
					<Route index element={<AdminStats />} />
					<Route path='users' element={<UsersPage />} />
					<Route path='admins' element={<AdminsPage />} />
					<Route path='lectures' element={<LecturesPage />} />
				</Routes>
			</div>
		</div>
	)
}

export default AdminPanel
