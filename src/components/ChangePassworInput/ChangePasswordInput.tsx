import FormInput from '../FormInput/FormInput'

const ChangePasswordInput = () => {
	return (
		<>
			<FormInput titleName='Пароль:' inputName='password' type='password' />
			<FormInput
				titleName='Новый пароль:'
				inputName='newPassword'
				type='password'
			/>
			<FormInput
				titleName='Подтвердите новый пароль:'
				inputName='confirmNewPassword'
				type='password'
			/>
		</>
	)
}

export default ChangePasswordInput
