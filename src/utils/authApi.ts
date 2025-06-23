import axios from 'axios'
import { apiUrl } from '../constants/urlConstants'
import { IMainApiConfig } from '../types/api'

class MainApi {
	private _url: string

	constructor(config: IMainApiConfig) {
		this._url = config.url
	}

	// Метод регистрации нового пользователя
	async register(
		firstName: string,
		lastName: string,
		login: string,
		role: string,
		city: string
	) {
		const response = await axios.post(
			`${this._url}/user`,
			{
				firstName,
				lastName,
				login,
				role,
				city,
			},
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)
		return response.data
	}

	// Метод авторизации пользователя
	async login(login: string, password: string) {
		const response = await axios.post(
			`${this._url}/auth/login`,
			{
				login,
				password,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
		return response.data
	}

	// Получение информации о пользователе
	async getUserInfo(token: string) {
		const response = await axios.get(`${this._url}/auth/profile`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	}

	// Обновление данных пользователя
	async updateUser(data: Partial<UserData>, token: string) {
		const response = await axios.patch(`${this._url}/auth/profile`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	}

	// Обновление информации о пользователе (пример, если понадобится)
	// async setUserInfo(username: string, email: string, token: string) {
	// 	const response = await axios.patch(`${this._url}/users/me`, {
	// 		name: username,
	// 		email,
	// 	}, {
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: `Bearer ${token}`,
	// 		},
	// 	})
	// 	return response.data
	// }
}

const mainApi = new MainApi({
	url: apiUrl,
})

export default mainApi
