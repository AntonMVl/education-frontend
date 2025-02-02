import { apiUrl } from '../constants/urlConstants'
import { IMainApiConfig } from '../types/api'

class MainApi {
	private _url: string

	constructor(config: IMainApiConfig) {
		this._url = config.url
	}

	// Метод проверки ответа от сервера
	private async _checkResponse(res: Response) {
		if (res.ok) {
			return await res.json()
		} else {
			throw new Error(`Ошибка: ${res.status}`)
		}
	}

	// Метод регистрации нового пользователя
	async register(
		firstName: string,
		lastName: string,
		login: string,
		role: string,
		city: string
	) {
		const response = await fetch(`${this._url}/user`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				firstName,
				lastName,
				login,
				role,
				city,
			}),
		})
		return this._checkResponse(response)
	}

	// Метод авторизации пользователя
	async login(login: string, password: string) {
		const response = await fetch(`${this._url}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				login,
				password,
			}),
		})
		return this._checkResponse(response)
	}

	// Получение информации о пользователе
	async getUserInfo(token: string) {
		const response = await fetch(`${this._url}/auth/profile`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return this._checkResponse(response)
	}

	// Обновление информации о пользователе
	// async setUserInfo(username: string, email: string, token: string) {
	// 	const response = await fetch(`${this._url}/users/me`, {
	// 		method: 'PATCH',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: `Bearer ${token}`,
	// 		},
	// 		body: JSON.stringify({
	// 			name: username,
	// 			email,
	// 		}),
	// 	})
	// 	return this._checkResponse(response)
	// }
}

const mainApi = new MainApi({
	url: apiUrl,
})

export default mainApi
