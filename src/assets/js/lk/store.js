import { createSlice, configureStore} from '@reduxjs/toolkit'


const lkSlice = createSlice({
  name: 'lk',
  initialState: {
    
  },
  reducers: {
		add:(state, action) =>{
			state.prods = action.payload

		}

		
  }
})

export const { add } = lkSlice.actions

export const store = configureStore({
  reducer: lkSlice.reducer
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