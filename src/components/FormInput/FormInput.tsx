import { FC, useState } from 'react'
import passwordClose from '../../assets/passwordClose.png'
import passwordOpen from '../../assets/passwordOpen.png'
import { FormInputProps } from '../../types/formInputTupes'
import styles from './FormInput.module.scss'

const FormInput: FC<FormInputProps> = ({
	titleName,
	inputName,
	type,
	onChange,
	disabled,
	defaultValue,
	isPasswordVisible,
	onTogglePasswordVisibility, // новый проп
	value,
	minLength,
}) => {
	const [inputStates, setInputStates] = useState<
		Record<string, { hasText: boolean; touched: boolean }>
	>({})

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

	const isPasswordField = type === 'password'
	const isLoginField = inputName === 'login'

	return (
		<fieldset className={styles.formInput__container}>
			<p className={styles.formInput__title}>{titleName}</p>
			<div className={styles.formInput__wrapper}>
				<input
					type={isPasswordField && isPasswordVisible ? 'text' : type}
					name={inputName}
					id={inputName}
					className={`${styles.formInput__input} ${
						inputStates[inputName]?.hasText
							? styles.formInput__input_type_active
							: ''
					}`}
					onChange={onChange}
					onBlur={handleBlur}
					autoComplete='off'
					required
					minLength={isLoginField ? 3 : minLength || 2}
					maxLength={30}
					{...(value !== undefined ? { value } : { defaultValue })}
					disabled={disabled}
				/>
				{isPasswordField && onTogglePasswordVisibility && (
					<button
						type='button'
						className={styles.formInput__togglePassword}
						onClick={onTogglePasswordVisibility}
					>
						<img
							src={isPasswordVisible ? passwordOpen : passwordClose}
							alt='Глазик'
							className={styles.formInput__togglePasswordEye}
						/>
					</button>
				)}
			</div>
		</fieldset>
	)
}

export default FormInput
