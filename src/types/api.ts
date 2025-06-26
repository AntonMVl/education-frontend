export interface IMainApiConfig {
	url: string
}

export type UserData = {
	id?: number
	firstName: string
	lastName: string
	login: string
	role: string
	city: string
	password?: string
	permissions?: string[]
}

export interface ISignUpProps {
	registration: (userData: UserData) => Promise<void>
	isPass?: boolean
}

export interface ISignInProps {
	login: (login: string, password: string) => void
	errorMessage?: string
	isPass?: boolean
}
