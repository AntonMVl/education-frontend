import { FC, useEffect, useState } from 'react'
import closeIcon from '../../assets/deleteMoviesButtonIcon.svg'
import { PopupProps } from '../../types/formInputTupes'
import styles from './Popup.module.scss'

const Popup: FC<PopupProps> = ({ isOpen, isPlainPassword, onClose }) => {
	const [isClosing, setIsClosing] = useState(false)

	const handleClose = () => {
		setIsClosing(true) // Запускаем анимацию закрытия
		setTimeout(() => {
			setIsClosing(false)
			onClose() // Закрываем попап после завершения анимации
		}, 400) // ⏳ 400ms — должно совпадать с `transition` в SCSS
	}

	// Закрытие по ESC
	useEffect(() => {
		const handleEscClose = (e: KeyboardEvent) => {
			if (e.key === 'Escape') handleClose()
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscClose)
		} else {
			document.removeEventListener('keydown', handleEscClose)
		}

		return () => document.removeEventListener('keydown', handleEscClose)
	}, [isOpen])

	// Если попап закрыт и анимация завершена — не рендерим его
	if (!isOpen && !isClosing) return null

	return (
		<section
			className={`${styles.popup} ${isOpen ? styles.popup__opened : ''}`}
		>
			<div className={styles.popup__container}>
				<button className={styles.popup__closeButton} onClick={onClose}>
					<img
						src={closeIcon}
						alt='close'
						className={styles.popup__closeIcon}
					/>
				</button>
				<p className={styles.popup__info}>
					Временный пароль: <strong>{isPlainPassword}</strong>
				</p>
			</div>
		</section>
	)
}

export default Popup
