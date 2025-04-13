import usePasswordVisibility from '../../hooks/usePasswordVisibility'
import FormInput from '../FormInput/FormInput'

const ChangePasswordInput = () => {
	const { isPasswordVisible, togglePasswordVisibility } =
		usePasswordVisibility()

	return (
		<>
			<FormInput
				titleName='Пароль:'
				inputName='password'
				type='password'
				isPasswordVisible={isPasswordVisible}
			/>
			<FormInput
				titleName='Новый пароль:'
				inputName='newPassword'
				type='password'
				isPasswordVisible={isPasswordVisible}
				// кнопка не отображается
			/>
			<FormInput
				titleName='Подтвердите новый пароль:'
				inputName='confirmNewPassword'
				type='password'
				isPasswordVisible={isPasswordVisible}
				onTogglePasswordVisibility={togglePasswordVisibility}

				// кнопка не отображается
			/>
		</>
	)
}

export default ChangePasswordInput
