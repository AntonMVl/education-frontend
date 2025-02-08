import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import Dropdown from '../../components/DropDown/DropDown'
import FormInput from '../../components/FormInput/FormInput'
import SignButton from '../../components/SignButton/SignButton'
import { cityNames } from '../../constants/DropDownOptionValuse'
import { IProfileProps } from '../../types/formInputTupes'
import styles from './UserAccount.module.scss'

const UserAccount: FC<IProfileProps> = ({ currentUser }) => {
	const [isEditing, setIsEditing] = useState<boolean>(false)

	const toggleButtonUserData = () => {
		setIsEditing(!isEditing)
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
	}

	return (
		<section className={styles.profile}>
			<Link to='/' className={styles.profile__button}>
				<img
					src={mainIcon}
					alt='main-icon'
					className={styles.profile__buttonIcon}
				/>
			</Link>
			<h1 className={styles.profile__title}>Ваш личный кабинет</h1>
			<form noValidate className={styles.profile__form} onSubmit={handleSubmit}>
				<div className={styles.profile__inputContainer}>
					<FormInput
						titleName='Имя:'
						inputName='firstName'
						type='text'
						defaultValue={currentUser.firstName}
						disabled={!isEditing}
					/>
					<FormInput
						titleName='Фамилия:'
						inputName='lastName'
						type='text'
						defaultValue={currentUser.lastName}
						disabled={!isEditing}
					/>
					<FormInput
						titleName='Login:'
						inputName='login'
						type='text'
						defaultValue={currentUser.login}
						disabled={!isEditing}
					/>
				</div>
				<div className={styles.profile__inputContainer}>
					<Dropdown
						name='City'
						options={cityNames}
						defaultValue={currentUser.city}
						disabled={!isEditing}
					/>
				</div>
				<div className={styles.profile__inputContainer}>
					{isEditing ? (
						<>
							<SignButton
								buttonText='Сохранить'
								type='submit'
								onClick={toggleButtonUserData}
							/>
							<SignButton
								buttonText='Назад'
								type='button'
								onClick={toggleButtonUserData}
							/>
						</>
					) : (
						<>
							<SignButton
								buttonText='Редактировать'
								type='button'
								onClick={toggleButtonUserData}
							/>
							<SignButton buttonText='К обучению' type='button' />
						</>
					)}
				</div>
			</form>
		</section>
	)
}
export default UserAccount
