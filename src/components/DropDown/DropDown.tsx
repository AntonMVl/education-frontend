import { FC, useEffect, useRef, useState } from 'react'
import { DropdownProps } from '../../types/formInputTupes'
import styles from './DropDown.module.scss'

const Dropdown: FC<DropdownProps> = ({ name, options, defaultValue }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedOption, setSelectedOption] = useState<string>(
		defaultValue || ''
	)
	const [filteredOptions, setFilteredOptions] = useState<string[]>(options)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Открытие/закрытие списка
	const toggleDropdown = () => {
		setIsOpen(prev => !prev)
	}

	// Выбор опции
	const handleOptionClick = (option: string) => {
		setSelectedOption(option)
		setIsOpen(false)
		setFilteredOptions(options) // Сброс фильтра после выбора
	}

	// Обработка ввода в поле
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSelectedOption(value)

		// Фильтрация списка опций
		setFilteredOptions(
			options.filter(option =>
				option.toLowerCase().startsWith(value.toLowerCase())
			)
		)
	}

	// Закрытие списка при клике вне компонента или нажатии Esc
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	return (
		<div className={styles.dropdown__container} ref={dropdownRef}>
			<label htmlFor={name} className={styles.dropdown__label}>
				{name}
			</label>
			<input
				type='text'
				className={`${styles.dropdown__input} ${
					isOpen ? styles.dropdown__input_active : ''
				}`}
				value={selectedOption}
				onClick={toggleDropdown}
				onChange={handleInputChange}
				placeholder='Выберите значение'
			/>
			{isOpen && (
				<ul className={styles.dropdown__menu}>
					{filteredOptions.length > 0 ? (
						filteredOptions.map(option => (
							<li
								key={option}
								className={styles.dropdown__option}
								onClick={() => handleOptionClick(option)}
							>
								{option}
							</li>
						))
					) : (
						<li className={styles.dropdown__noOptions}>Ничего не найдено</li>
					)}
				</ul>
			)}
			<input type='hidden' name={name} value={selectedOption} />
		</div>
	)
}

export default Dropdown
