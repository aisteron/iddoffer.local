import { createSlice, configureStore, current } from '@reduxjs/toolkit'


const userSlice = createSlice({
  name: 'user',
  initialState: {
		open: false,
    mode: "auth",
		errors: [],
		username: null
  },

  reducers: {

    close: (state) => { state.open = false },
		mode:(state,action) => {
			state.mode = action.payload.mode,
			state.open = true
			
			action.payload.username !== undefined && (state.username = action.payload.username)
			action.payload.access_token && localStorage.setItem("access_token", action.payload.access_token)
		},
  
		
  }
})

export const { close, mode } = userSlice.actions

export const store = configureStore({
  reducer: userSlice.reducer
})



