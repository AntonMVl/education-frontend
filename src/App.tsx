import { Route, Routes } from 'react-router-dom'
import './App.scss'
import StartPage from './pages/StartPage/StartPage'

function App() {
	return (
		<div className='body'>
			<div className='page'>
				<Routes>
					<Route path='/' element={<StartPage />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
