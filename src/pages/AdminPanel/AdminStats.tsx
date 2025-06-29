import React from 'react'
import styles from './AdminStats.module.scss'

const AdminStats: React.FC = () => {
	return (
		<div className={styles.statsWrapper}>
			<h1>Статистика по использованию приложения</h1>
			<div className={styles.statsGrid}>
				<div className={styles.statCard}>
					<div className={styles.statValue}>—</div>
					<div className={styles.statLabel}>Пользователей</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statValue}>—</div>
					<div className={styles.statLabel}>Курсов</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statValue}>—</div>
					<div className={styles.statLabel}>Лекций</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statValue}>—</div>
					<div className={styles.statLabel}>Экзаменов</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statValue}>—</div>
					<div className={styles.statLabel}>Средний балл</div>
				</div>
			</div>
			{/* Здесь позже будут графики и подробная статистика */}
		</div>
	)
}

export default AdminStats
