import { FC, useState } from 'react'
import passwordClose from '../../assets/passwordClose.png'
import passwordOpen from '../../assets/passwordOpen.png'
import { FormInputProps } from '../../types/formInputTupes'
import styles from './FormInput.module.scss'

const FormInput: FC<FormInputProps> = ({
	titleName,
	inputName,
	type,
	errorMessage = 'Поле обязательно для заполнения',
}) => {
	const [inputStates, setInputStates] = useState<
		Record<string, { hasText: boolean; touched: boolean }>
	>({})
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setInputStates(prevState => ({
			...prevState,
			[name]: {
				...prevState[name],
				hasText: value.trim().length > 0,
			},
		}))
	}

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		const { name } = event.target
		setInputStates(prevState => ({
			...prevState,
			[name]: {
				...prevState[name],
				touched: true,
			},
		}))
	}

	const togglePasswordVisibility = () => {
		setIsPasswordVisible(prevState => !prevState)
	}

	return (
		<fieldset className={styles.formInput__container}>
			<p className={styles.formInput__title}>{titleName}</p>
			<div className={styles.formInput__wrapper}>
				<input
					type={type === 'password' && isPasswordVisible ? 'text' : type}
					name={inputName}
					id={inputName}
					className={`${styles.formInput__input} ${
						inputStates[inputName]?.hasText
							? styles.formInput__input_type_active
							: ''
					}`}
					onChange={handleInputChange}
					onBlur={handleBlur}
					autoComplete='off'
					required
					minLength={2}
					maxLength={30}
				/>
				{type === 'password' && (
					<button
						type='button'
						className={styles.formInput__togglePassword}
						onClick={togglePasswordVisibility}
					>
						{isPasswordVisible ? (
							<img
								src={passwordOpen}
								alt='Глазик'
								className={styles.formInput__togglePasswordEye}
							/>
						) : (
							<img
								src={passwordClose}
								alt='Глазик'
								className={styles.formInput__togglePasswordEye}
							/>
						)}
					</button>
				)}
			</div>
			<span
				className={`${styles.formInput__inputError} ${
					inputStates[inputName]?.touched && !inputStates[inputName]?.hasText
						? styles.formInput__inputError_type_active
						: ''
				}`}
			>
				{errorMessage}
			</span>
		</fieldset>
	)
}

export default FormInput
