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
			
			action.payload.username === null && (state.mode = "auth")
			state.data = action.payload
			state.loading = false

			action.payload.role && (state.mode = action.payload.role)
			
		},

		set_mode:(state,action) => {
			state.loading = false
			state.mode = action.payload
		},
		user_upload_file:(state, action) =>{
			let obj = {name: action.payload.name, path: action.payload.path}
			
			if(state.data.files){
				let files = JSON.parse(state.data.files)
				files.push(obj)
				state.data.files = JSON.stringify(files)
			} else {
				state.data.files = "["+JSON.stringify(obj)+"]"
			}
		}

		
  }
})

export const { add,set_current_user,reset_password,set_mode,user_upload_file } = lkSlice.actions

export const store = configureStore({
  reducer: lkSlice.reducer
})


export const fetch_user_thunk = () => {
	
	return async function fetchUser(dispatch, getState){

		const response = await xml("get_current_user",null,"/api/user").then(r => JSON.parse(r))
		dispatch(set_current_user(response))
	}
}

export const check_expired_token_thunk = (token) => {
	
	return async function fetchUser(dispatch, getState){

		const response = await xml("check_expired_token",{token: token},"/api/user").then(r => JSON.parse(r))
		response.success ? dispatch(set_mode("reset")) : dispatch(set_mode("expired"))
		//dispatch(set_current_user(response))
	}
}