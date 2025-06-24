import React from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './AdminPanel.module.scss'

const menu = [
	{ path: '/admin', label: 'Статистика' },
	{ path: '/admin/users', label: 'Пользователи' },
	{ path: '/admin/admins', label: 'Администраторы' },
	{ path: '/admin/courses', label: 'Курсы' },
	{ path: '/admin/practice-check', label: 'Практика' },
	{ path: '/admin/stats', label: 'Отчёты' },
]

const AdminPanel: React.FC = () => {
	const location = useLocation()
	return (
		<div className={styles.adminPanel}>
			<aside className={styles.sidebar}>
				<nav>
					<ul>
						{menu.map(item => (
							<li key={item.path}>
								<NavLink
									to={item.path}
									className={({ isActive }) =>
										isActive ||
										(item.path === '/admin' && location.pathname === '/admin')
											? styles.active
											: ''
									}
									end={item.path === '/admin'}
								>
									{item.label}
								</NavLink>
							</li>
						))}
						<li>
							<Link to='/admin/lectures' className={styles.navLink}>
								<span className={styles.navIcon}>📚</span>
								Лекции
							</Link>
						</li>
					</ul>
				</nav>
			</aside>
			<main className={styles.content}>
				<Outlet />
			</main>
		</div>
	)
}

export default AdminPanel
