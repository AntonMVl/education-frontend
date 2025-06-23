import usePasswordVisibility from '../../hooks/usePasswordVisibility'
import FormInput from '../FormInput/FormInput'

interface ChangePasswordInputProps {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	disabled?: boolean
}

const ChangePasswordInput: React.FC<ChangePasswordInputProps> = ({
	onChange,
	disabled,
}) => {
	const { isPasswordVisible, togglePasswordVisibility } =
		usePasswordVisibility()

	return (
		<>
			<FormInput
				titleName='Новый пароль:'
				inputName='newPassword'
				type='password'
				isPasswordVisible={isPasswordVisible}
				onChange={onChange}
				disabled={disabled}
			/>
			<FormInput
				titleName='Подтвердите новый пароль:'
				inputName='confirmNewPassword'
				type='password'
				isPasswordVisible={isPasswordVisible}
				onChange={onChange}
				disabled={disabled}
				onTogglePasswordVisibility={togglePasswordVisibility}
			/>
		</>
	)
}

export default ChangePasswordInput
