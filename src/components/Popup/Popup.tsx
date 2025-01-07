import { FC } from 'react'
import closeIcon from '../../assets/deleteMoviesButtonIcon.svg'
import { PopupProps } from '../../types/formInputTupes'
import styles from './Popup.module.scss'

const Popup: FC<PopupProps> = ({ isOpen }) => {
	return (
		<section
			className={`${styles.popup} ${isOpen ? styles.popup__opened : ''}`}
		>
			<div className={styles.popup__container}>
				<button className={styles.popup__closeButton}>
					<img
						src={closeIcon}
						alt='close'
						className={styles.popup__closeIcon}
					/>
				</button>
				<p className={styles.popup__info}>
					Логин может содержать латинские буквы и цифры.
				</p>
				<p className={styles.popup__info}>
					{' '}
					Необходим, для дальнейшего использования при входе на данную
					платформу.
				</p>
			</div>
		</section>
	)
}

export default Popup
