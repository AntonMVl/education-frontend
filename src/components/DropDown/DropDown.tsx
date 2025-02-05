import { FC, useEffect, useRef, useState } from 'react'
import { DropdownProps } from '../../types/formInputTupes'
import styles from './DropDown.module.scss'

const Dropdown: FC<DropdownProps> = ({
	name,
	options,
	defaultValue,
	disabled,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedOption, setSelectedOption] = useState<string>(
		defaultValue || options[0]
	) // ✅ Гарантируем начальное значение
	const [filteredOptions, setFilteredOptions] = useState<string[]>(options)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		// Закрытие dropdown при нажатии Escape
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)

		// Очистка обработчиков при размонтировании
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	// Обработчик выбора опции
	const handleOptionClick = (option: string) => {
		setSelectedOption(option)
		setIsOpen(false)
		setFilteredOptions(options)

		// Создаем совместимый `ChangeEvent`
		const event = {
			target: { name, value: option },
		} as React.ChangeEvent<HTMLInputElement>
		onChange(event) // ✅ Теперь TypeScript доволен
	}

	// Обработчик ввода
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSelectedOption(value)

		// Фильтрация списка опций
		setFilteredOptions(
			options.filter(option =>
				option.toLowerCase().startsWith(value.toLowerCase())
			)
		)

		onChange(e) // ✅ Передаем корректный event
	}

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
				onClick={() => setIsOpen(prev => !prev)}
				onChange={handleInputChange}
				placeholder='Выберите значение'
				disabled={disabled}
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
