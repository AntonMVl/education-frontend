import React from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import styles from './AdminPanel.module.scss'
import AdminsPage from './AdminsPage'
import AdminStats from './AdminStats'
import CourseManagement from './CourseManagement/CourseManagement'
import LectureManagement from './LectureManagement/LectureManagement'
import TestManagement from './TestManagement/TestManagement'
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
						to='/admin/courses'
						className={`${styles.navLink} ${
							isActiveLink('/admin/courses') ? styles.active : ''
						}`}
					>
						Курсы
					</Link>

					<Link
						to='/admin/lectures'
						className={`${styles.navLink} ${
							isActiveLink('/admin/lectures') ? styles.active : ''
						}`}
					>
						Лекции
					</Link>

					<Link
						to='/admin/tests'
						className={`${styles.navLink} ${
							isActiveLink('/admin/tests') ? styles.active : ''
						}`}
					>
						Тесты
					</Link>
				</nav>
			</div>

			<div className={styles.content}>
				<Routes>
					<Route index element={<AdminStats />} />
					<Route path='users' element={<UsersPage />} />
					<Route path='admins' element={<AdminsPage />} />
					<Route path='courses' element={<CourseManagement />} />
					<Route path='lectures' element={<LectureManagement />} />
					<Route path='tests' element={<TestManagement />} />
				</Routes>
			</div>
		</div>
	)
}

export default AdminPanel
