import { useCallback, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.scss'
import Popup from './components/Popup/Popup'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import StartPage from './pages/StartPage/StartPage'
import { UserData } from './types/api'
import mainApi from './utils/authApi'

function App() {
	const [isPass, setIsPass] = useState(false)
	const [loggedIn, setLoggedIn] = useState(false)
	const [isError, setIsError] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string>('')
	const [isOpen, setIsOpen] = useState(false)
	const [isPlainPassword, setIsPlainPassword] = useState('')
	const navigate = useNavigate()

	const closeAllPopups = useCallback(() => {
		setIsOpen(false)
		setIsPlainPassword('')
	}, [])

	async function login(login: string, password: string) {
		try {
			setIsPass(true)
			const response = await mainApi.login(login, password)
			const token = response?.token
			if (token) {
				localStorage.setItem('jwt', token)
				setLoggedIn(true)
				setErrorMessage(null)
				navigate('/', { replace: true })
			} else {
				setErrorMessage('Ошибка: токен не найден')
				console.error('Ошибка авторизации: токен не найден', response)
			}
		} catch (error) {
			setErrorMessage('Неверный логин или пароль')
			setIsError(true)
			console.error(`Ошибка входа в аккаунт ${error}`)
		} finally {
			setIsPass(false)
		}
	}

	async function registration(userData: UserData) {
		try {
			setIsPass(true)
			const response = await mainApi.register(
				userData.firstName,
				userData.lastName,
				userData.login,
				userData.role,
				userData.city
			)
			const { plainPassword } = response
			if (plainPassword) {
				setIsPlainPassword(plainPassword)
				console.log('Пароль для сохранения:', plainPassword)
				setIsOpen(true)
			} else {
				console.error('Ошибка получения пароля для автоматической авторизации')
			}
		} catch (error) {
			setIsError(true)
			console.error(`Ошибка регистрации ${error}`)
		} finally {
			setIsPass(false)
		}
	}

	return (
		<div className='body'>
			<div className='page'>
				<Routes>
					<Route path='/' element={<StartPage />} />
					<Route
						path='/signin'
						element={<SignIn login={login} errorMessage={errorMessage} />}
					/>
					<Route
						path='/signup'
						element={<SignUp registration={registration} />}
					/>
				</Routes>
			</div>
			<Popup
				isOpen={isOpen}
				isPlainPassword={isPlainPassword}
				onClose={closeAllPopups}
			/>
		</div>
	)
}

export default App
