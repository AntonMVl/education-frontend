import { FC, useState } from 'react'
import { FormInputProps } from '../../types/formInputTupes'
import styles from './FormInput.module.scss'

const FormInput: FC<FormInputProps> = ({
	titleName,
	inputName,
	errorMessage = 'Поле обязательно для заполнения',
}) => {
	const [inputStates, setInputStates] = useState<
		Record<string, { hasText: boolean; touched: boolean }>
	>({})

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

	return (
		<fieldset className={styles.formInput__container}>
			<p className={styles.formInput__title}>{titleName}</p>
			<input
				type='text'
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
