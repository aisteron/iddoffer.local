import { createSlice, configureStore, current } from '@reduxjs/toolkit'
import { dx } from '../../ui/filter/dexie';
import { xml } from '../../libs';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    prods: [],
		//total: null
  },
  reducers: {
		add:(state, action) =>{
			state.prods = action.payload
			//state.total = action.payload.reduce((acc, cur) => acc += cur.price * cur.count, 0)
		},
    recount: (state,action) => {
			const {id, count} = action.payload
			state.prods.map(el => el.id == id && (el.count = count))
			//state.total = state.prods.reduce((acc, cur) => acc += cur.price * cur.count, 0)
    },
		replace: (state,action)=>{
			const{id, obj} = action.payload
			//console.log(id,obj)
			let st = JSON.parse(JSON.stringify(state, undefined, 2))
			
			let once = false // могут быть одинаковые id из-за модификаций
			
			state.prods = st.prods.map(p => {
				if(p.id == id && !once){
					once = true	
					return obj
				} else {
					return p
				}
				
			})

		},
		remove:(state, action) => {
			state.prods = state.prods.filter(el => el.id !== action.payload)
		},
		textarea:(state, action) => {
			const{id, value} = action.payload
			state.prods.map(el => el.id == id ? el.txt = value : el)
		},
		clean:(state) =>{
			state.prods = []
		}

		
  }
})

export const { add,recount, replace, textarea, remove, clean } = cartSlice.actions

export const store = configureStore({
  reducer: cartSlice.reducer
})


export const thunkFunction = ({id, replaceid}) => {
	let db = dx.init()

	return async function fetch(dispatch, getState){
		let old = getState().prods.filter(el => el.id == id)[0]
		
		let resp = await xml('replace_prod', {k: old.key, replaceid}, '/api/cart') // string new key

		let res = await db.mod.where('ids').anyOf(id).toArray()
		if(!res.length){console.log('Не нашел модификацию'); return}

		

		res = res[0].prods.filter(el => el.id == replaceid)[0]
		let obj = {
			id: res.id,
			article: res.article,
			count: old.count,
			key: resp,
			name: res.name,
			price: res.price,
			uri: res.uri
		}
		
		dispatch(replace({id, obj}))
	}
}