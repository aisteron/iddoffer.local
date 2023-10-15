import { createSlice, configureStore} from '@reduxjs/toolkit'
import {xml} from '../libs'

const lkSlice = createSlice({
  name: 'lk',
  initialState: {
    loading: true,
		mode: null
  },
  
	reducers: {

		add:(state, action) =>{
			state.prods = action.payload

		},
		set_current_user:(state, action) => {
			
			//console.log(action.payload)
			action.payload.username === null && (state.mode = "auth")
			state.data = action.payload
			state.loading = false
			
		},

		set_mode:(state,action) => {
			state.loading = false
			state.mode = action.payload
		}

		
  }
})

export const { add,set_current_user,reset_password,set_mode } = lkSlice.actions

export const store = configureStore({
  reducer: lkSlice.reducer
})


export const fetch_user_thunk = () => {
	
	return async function fetchUser(dispatch, getState){

		const response = await xml("get_current_user",null,"/api/user").then(r => JSON.parse(r))
		dispatch(set_current_user(response))
	}
}