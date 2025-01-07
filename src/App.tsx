import { Route, Routes } from 'react-router-dom'
import './App.scss'
// import SignIn from './pages/SignIn/SignIn'
import { useState } from 'react'
import Popup from './components/Popup/Popup'
import SignUp from './pages/SignUp/SignUp'
import StartPage from './pages/StartPage/StartPage'

function App() {
	const [isOpen, setIsOpen] = useState<boolean>(true)

	return (
		<div className='body'>
			<div className='page'>
				<Routes>
					<Route path='/' element={<StartPage />} />
					{/* <Route path='/signin' element={<SignIn />} /> */}
					<Route path='/signup' element={<SignUp />} />
				</Routes>
			</div>
			<Popup isOpen={isOpen} />
		</div>
	)
}

export default App
