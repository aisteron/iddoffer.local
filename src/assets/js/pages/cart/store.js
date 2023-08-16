import { createSlice, configureStore, current } from '@reduxjs/toolkit'
import { dx } from '../../ui/filter/dexie';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    prods: [],
		total: null
  },
  reducers: {
		add:(state, action) =>{
			state.prods = action.payload
			state.total = action.payload.reduce((acc, cur) => acc += cur.price * cur.count, 0)
		},
    recount: (state,action) => {
			const {id, count} = action.payload
			state.prods.map(el => el.id == id && (el.count = count))
			state.total = state.prods.reduce((acc, cur) => acc += cur.price * cur.count, 0)
    },
		replace: async (state,action)=>{
			const{id, replaceid} = action.payload
			let db = dx.init()
			console.log(await db.mod.where('ids').anyOf(id).toArray())
			return state
		}

		
  }
})

export const { add,recount, replace } = cartSlice.actions

export const store = configureStore({
  reducer: cartSlice.reducer
})