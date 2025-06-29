import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useNavigate } from 'react-router-dom'
import adminApi from './api/adminApi'
import './App.scss'
import Layout from './components/Layout/Layout'
import Popup from './components/Popup/Popup'
import Preloader from './components/Preloader/Preloader'
import { AdminPanel } from './pages/AdminPanel'
import Courses from './pages/Courses/Courses'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import StartPage from './pages/StartPage/StartPage'
import UserAccount from './pages/UserAccount/UserAccount'
import { RootState } from './store/store'
import { clearUser, setUser } from './store/userSlice'
import { UserData } from './types/api'
import mainApi from './utils/authApi'

function App() {
	const [isPass, setIsPass] = useState<boolean>(false)
	const [loggedIn, setLoggedIn] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')
	const [isTokenCheck, setIsTokenCheck] = useState<boolean>(true)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [isPlainPassword, setIsPlainPassword] = useState<string>('')
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const closeAllPopups = useCallback(() => {
		setIsOpen(false)
		setIsPlainPassword('')
	}, [])

	useEffect(() => {
		if (localStorage.jwt) {
			mainApi
				.getUserInfo(localStorage.jwt)
				.then(async userData => {
					setLoggedIn(true)

					// Загружаем права пользователя
					const permissions = await loadUserPermissions()

					// Обновляем данные пользователя с правами
					const userWithPermissions = {
						...userData,
						permissions: permissions,
					}

					dispatch(setUser(userWithPermissions))
				})
				.catch(err => {
					console.error(`Ошибка при загрузке данных пользователя ${err}`)
					localStorage.clear()
					setLoggedIn(false)
					dispatch(clearUser())
				})
				.finally(() => setIsTokenCheck(false))
		} else {
			setLoggedIn(false)
			setIsTokenCheck(false)
			localStorage.clear()
			dispatch(clearUser())
		}
	}, [dispatch])

	// Функция для загрузки прав пользователя
	const loadUserPermissions = async () => {
		try {
			const permissions = await adminApi.getMyPermissions()
			return permissions
		} catch (error) {
			console.error('Ошибка загрузки прав пользователя:', error)
			return []
		}
	}

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

				// Загружаем права пользователя
				const permissions = await loadUserPermissions()

				// Обновляем данные пользователя с правами
				const userWithPermissions = {
					...userData,
					permissions: permissions,
				}

				dispatch(setUser(userWithPermissions))
			} else {
				setErrorMessage('Ошибка: токен не найден')
				console.error('Ошибка авторизации: токен не найден', response)
			}
		} catch (error) {
			setErrorMessage('Неверный логин или пароль')
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
			console.error(`Ошибка регистрации ${error}`)
		} finally {
			setIsPass(false)
		}
	}

	const signOut = () => {
		localStorage.clear()
		setLoggedIn(false)
		navigate('/', { replace: true })
		dispatch(clearUser())
	}

	function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
		const currentUser = useSelector((state: RootState) => state.user.user)
		if (!currentUser) {
			return <Preloader />
		}
		const role = currentUser.role?.toLowerCase()
		if (role !== 'admin' && role !== 'superadmin') {
			return <div style={{ padding: 40, color: 'red' }}>Нет доступа</div>
		}
		return children
	}

	return (
		<div className='body'>
			{isTokenCheck ? (
				<Preloader />
			) : (
				<div className='page'>
					<Routes>
						<Route element={<Layout loggedIn={loggedIn} signOut={signOut} />}>
							<Route path='/' element={<StartPage />} />
							<Route
								path='/signin'
								element={
									<SignIn
										login={login}
										errorMessage={errorMessage}
										isPass={isPass}
									/>
								}
							/>
							<Route
								path='/signup'
								element={<SignUp registration={registration} isPass={isPass} />}
							/>
							<Route path='/profile' element={<UserAccount />} />
							<Route path='/courses' element={<Courses />} />
							<Route
								path='/admin/*'
								element={
									<ProtectedAdminRoute>
										<AdminPanel />
									</ProtectedAdminRoute>
								}
							/>
						</Route>
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
