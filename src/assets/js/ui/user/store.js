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

    close: (state,action) => {


      state.open = false
      

    },
		mode:(state,action) => {
			state.mode = action.payload.mode,
			state.open = true
			action.payload.username
			&& (state.username = action.payload.username)
		}
  
		
  }
})

export const { close, mode } = userSlice.actions

export const store = configureStore({
  reducer: userSlice.reducer
})



