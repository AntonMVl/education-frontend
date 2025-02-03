import { ChangeEvent } from 'react'

export interface FormInputProps {
	titleName: string
	inputName: string
	type: string
	errorMessage?: string
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export interface PopupProps {
	isOpen: boolean
	onClose: () => void
	isPlainPassword: string
}

export interface DropdownProps {
	name: string
	options: string[]
	defaultValue?: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
