import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.scss'
import Popup from './components/Popup/Popup'
import Preloader from './components/Preloader/Preloader'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import StartPage from './pages/StartPage/StartPage'
import UserAccount from './pages/UserAccount/UserAccount'
import { UserData } from './types/api'
import mainApi from './utils/authApi'

function App() {
	const [isPass, setIsPass] = useState<boolean>(false)
	const [loggedIn, setLoggedIn] = useState<boolean>(false)
	const [isError, setIsError] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')
	const [currentUser, setCurrentUser] = useState<UserData>({
		firstName: '',
		lastName: '',
		login: '',
		role: '',
		city: '',
	})
	const [isTokenCheck, setIsTokenCheck] = useState<boolean>(true)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [isPlainPassword, setIsPlainPassword] = useState<string>('')
	const navigate = useNavigate()

	const closeAllPopups = useCallback(() => {
		setIsOpen(false)
		setIsPlainPassword('')
	}, [])

	useEffect(() => {
		if (localStorage.jwt) {
			mainApi
				.getUserInfo(localStorage.jwt)
				.then(userData => {
					setCurrentUser(prev => ({ ...prev, ...userData }))
					setLoggedIn(true)
				})
				.catch(err => {
					console.error(`Ошибка при загрузке данных пользователя ${err}`)
					localStorage.clear()
					setLoggedIn(false)
				})
				.finally(() => setIsTokenCheck(false))
		} else {
			setLoggedIn(false)
			setIsTokenCheck(false)
			localStorage.clear()
		}
	}, [])

	async function login(login: string, password: string) {
		try {
			setIsPass(true)
			const response = await mainApi.login(login, password)
			const token = response?.token
			if (token) {
				localStorage.setItem('jwt', token)
				setLoggedIn(true)
				setErrorMessage('')
				navigate('/', { replace: true })

				const userData = await mainApi.getUserInfo(token)
				setCurrentUser(userData)
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

	const signOut = () => {
		localStorage.clear()
		setLoggedIn(false)
		navigate('/', { replace: true })
	}

	return (
		<div className='body'>
			{isTokenCheck ? (
				<Preloader />
			) : (
				<div className='page'>
					<Routes>
						<Route
							path='/'
							element={<StartPage loggedIn={loggedIn} signOut={signOut} />}
						/>
						<Route
							path='/signin'
							element={<SignIn login={login} errorMessage={errorMessage} />}
						/>
						<Route
							path='/signup'
							element={<SignUp registration={registration} />}
						/>
						<Route
							path='/profile'
							element={<UserAccount currentUser={currentUser} />}
						/>
					</Routes>
				</div>
			)}
			<Popup
				isOpen={isOpen}
				isPlainPassword={isPlainPassword}
				onClose={closeAllPopups}
			/>
		</div>
	)
}

export default App
