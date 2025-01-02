import { FC } from 'react'
import styles from './Footer.module.scss'

export const Footer: FC = () => {
	return (
		<section className={styles.footer}>
			<h1 className={styles.footer__title}>ЭКЦ МВД по Республике Коми, 2025</h1>
		</section>
	)
}
