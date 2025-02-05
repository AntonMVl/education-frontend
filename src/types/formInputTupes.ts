import { ChangeEvent } from 'react'
import { UserData } from './api'

export interface FormInputProps {
	titleName: string
	inputName: string
	type: string
	defaultValue?: string
	errorMessage?: string
	disabled?: boolean
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
	disabled?: boolean
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface IProfileProps {
	currentUser: UserData
}
