import { FC, useState } from 'react'
import styles from './DropDown.module.scss'

const Dropdown: FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedOption, setSelectedOption] = useState<string>('User')

	const options = ['User', 'TeamLeader', 'Admin']

	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const handleOptionClick = (option: string) => {
		setSelectedOption(option)
		setIsOpen(false)
	}

	return (
		<div className={styles.dropdown__container}>
			<div
				className={`${styles.dropdown__input} ${
					isOpen ? styles.dropdown__input_active : ''
				}`}
				onClick={toggleDropdown}
			>
				{selectedOption}
			</div>
			{isOpen && (
				<ul className={styles.dropdown__menu}>
					{options.map(option => (
						<li
							key={option}
							className={styles.dropdown__option}
							onClick={() => handleOptionClick(option)}
						>
							{option}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default Dropdown
