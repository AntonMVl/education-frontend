import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import mainIcon from '../../assets/main-icon.png'
import Dropdown from '../../components/DropDown/DropDown'
import FormInput from '../../components/FormInput/FormInput'
import { cityNames } from '../../constants/DropDownOptionValuse'
import { IProfileProps } from '../../types/formInputTupes'
import styles from './UserAccount.module.scss'

const UserAccount: FC<IProfileProps> = ({ currentUser }) => {
	const [isEditing, setIsEditing] = useState<boolean>(false)

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
			<form noValidate className={styles.profile__form}>
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
						name='city'
						options={cityNames}
						defaultValue={currentUser.city}
						disabled={!isEditing}
					/>
				</div>
			</form>
		</section>
	)
}
export default UserAccount
