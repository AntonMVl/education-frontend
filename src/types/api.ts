export interface IMainApiConfig {
	url: string
}

export type UserData = {
	firstName: string
	lastName: string
	login: string
	role: string
	city: string
}

export interface ISignUpProps {
	registration: (userData: UserData) => Promise<void>
}

export interface ISignInProps {
	login: (login: string, password: string) => void
	errorMessage?: string
}
