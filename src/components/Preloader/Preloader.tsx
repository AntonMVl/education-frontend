import { FC } from 'react'
import styles from './Preloader.module.scss'

const Preloader: FC = () => {
	return (
		<div className={styles.preloader}>
			<div className={styles.preloader__container}>
				<div className={styles.preloader__round}></div>
			</div>
		</div>
	)
}

export default Preloader
