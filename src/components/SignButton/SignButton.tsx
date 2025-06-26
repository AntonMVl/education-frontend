import { FC } from 'react'
import { IButtonProps } from '../../types/buttonTypes'
import styles from './SignButton.module.scss'

const SignButton: FC<IButtonProps> = ({
	buttonText,
	type,
	onClick,
	disabled = false,
}) => {
	return (
		<button
			className={styles.sign__button}
			type={type}
			onClick={onClick}
			disabled={disabled}
		>
			{buttonText}
		</button>
	)
}

export default SignButton
