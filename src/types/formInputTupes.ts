export interface FormInputProps {
	titleName: string
	inputName: string
	errorMessage?: string
}

export interface PopupProps {
	isOpen: boolean
}

export interface DropdownProps {
	name: string
	options: string[]
	defaultValue?: string
}
