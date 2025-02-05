import { FC } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Header/Header'
import { IStartPageProps } from '../../types/startPageTypes'
import styles from './startPage.module.scss'

const StartPage: FC<IStartPageProps> = ({ loggedIn, signOut }) => {
	return (
		<div className={styles.page}>
			<Header loggedIn={loggedIn} signOut={signOut} />
			<section className={styles.page__container}>
				<h1>
					Тут будет содержимое первой страницы - текст, кнопки и прочая хрень
				</h1>
			</section>
			<Footer />
		</div>
	)
}

export default StartPage
