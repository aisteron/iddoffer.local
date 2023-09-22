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

    checkbox: (state,action) => {


      if(!action.payload.data.length) {
        state.filters = state.filters.filter(f => f.name !== action.payload.name)
        return;
      }
      if(!state.filters.length){
        state.filters.push(action.payload)
        return;
      }

      state.filters.forEach(f => {

        f.name == action.payload.name
        ? f.data = action.payload.data
        : state.filters.push(action.payload)
          
      })
      

    },
		mode:(state,action) => {
			state.mode = action.payload.mode,
			state.open = true
			action.payload.username
			&& (state.username = action.payload.username)
		}
  
		
  }
})

export const { checkbox, mode } = userSlice.actions

export const store = configureStore({
  reducer: userSlice.reducer
})



