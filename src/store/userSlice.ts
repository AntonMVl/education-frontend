import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserData } from '../types/api'

interface UserState {
	user: UserData | null
}

const initialState: UserState = {
	user: null,
}

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<UserData>) {
			state.user = action.payload
		},
		updateUser(state, action: PayloadAction<Partial<UserData>>) {
			if (state.user) {
				state.user = { ...state.user, ...action.payload }
			}
		},
		clearUser(state) {
			state.user = null
		},
	},
})

export const { setUser, updateUser, clearUser } = userSlice.actions
export default userSlice.reducer
