import { createSlice, configureStore} from '@reduxjs/toolkit'
import {xml} from '../libs'

const lkSlice = createSlice({
  name: 'lk',
  initialState: {
    loading: true
  },
  reducers: {

		add:(state, action) =>{
			state.prods = action.payload

		},
		set_current_user:(state, action) => {
			
			console.log(action.payload)
			state.data = action.payload
			state.loading = false
			
		}

		
  }
})

export const { add,set_current_user } = lkSlice.actions

export const store = configureStore({
  reducer: lkSlice.reducer
})


export const fetch_user_thunk = () => {
	
	return async function fetchUser(dispatch, getState){

		const response = await xml("get_current_user",null,"/api/user").then(r => JSON.parse(r))
		dispatch(set_current_user(response))
	}
}