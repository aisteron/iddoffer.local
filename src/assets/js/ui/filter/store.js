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

// export const ls = {
// 	ed: document.head.querySelector('[name="editedon"]').getAttribute("content"),
// 	valid(){
// 		let ed_saved = localStorage.getItem('editedon')
// 		if(!ed_saved) return false
// 		if(ed_saved !== this.ed) return false
// 		return true
// 	},
// 	update(){
// 		localStorage.setItem("editedon", this.ed)
// 	}
// }
