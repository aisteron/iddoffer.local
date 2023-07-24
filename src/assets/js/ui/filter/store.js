import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

export const store = configureStore({
  reducer: counterSlice.reducer
})

export const ls = {
	get(){
		let h = localStorage.getItem('hash')
		if(!h) return false
		return h ? JSON.parse(h) : h
	}
}
