import { Route, Routes } from 'react-router-dom'
import './App.scss'
// import SignIn from './pages/SignIn/SignIn'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import StartPage from './pages/StartPage/StartPage'

function App() {
	return (
		<div className='body'>
			<div className='page'>
				<Routes>
					<Route path='/' element={<StartPage />} />
					<Route path='/signin' element={<SignIn />} />
					<Route path='/signup' element={<SignUp />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
