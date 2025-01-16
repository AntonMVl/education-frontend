export interface FormInputProps {
	titleName: string
	inputName: string
	type: string
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
