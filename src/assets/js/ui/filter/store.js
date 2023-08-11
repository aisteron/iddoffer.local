import { createSlice, configureStore, current } from '@reduxjs/toolkit'


const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    filters: [],
		pagination:{
			page: 1,
			perpage: +document.head.querySelector('[name="perpage"]')?.getAttribute("content"),
			//perpage: 1,
		},
		sort: null
  },
  reducers: {

		// state.pagination.page = 1 !

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
    design:(state, action) =>{
      let obj = {name: "design", data: action.payload}

      let res = state.filters.filter(el => el.name == 'design');
      !res.length && state.filters.push(obj)
      !action.payload
      && (state.filters = state.filters.filter(f => f.name !== "design") )
    },
    size:(state,action) => {

      

      let res = state.filters.filter(el => el.name == 'size')
      let obj = { name: 'size', data: []}

      if(!action.payload.data.length){
        // удалеяем фильтр, если пришел пустой массив
        if(!res.length) return
        
        res = res[0].data.filter(f => f.name !== action.payload.name)
        //console.log(JSON.stringify(res, undefined, 2))
        
        
        !res.length
        ? state.filters = state.filters.filter(el => el.name !== 'size')
        : state.filters.map(el => el.name == 'size' && (el.data = res))

        return

      }

      
      
      if(!res.length){
        obj.data.push(action.payload)
        state.filters.push(obj)
      } else {
          // console.log(JSON.stringify(f, undefined, 2))

          res.forEach(f => {
            if(f.name == 'size'){
              // если есть фильтр, то обновляем его поле data
              f.data.map(el => el.name == action.payload.name && (el.data = action.payload.data))
              
              // если нет - добавляем его в массив фильтров
              let r = f.data.filter(el => el.name == action.payload.name).length
              !r && f.data.push({name: action.payload.name, data: action.payload.data})
            }
          })
          
          
      }
      
      
    },
    chips:(state, action)=>{
      // click on close for reset filter
      switch(action.payload.name){
        case 'color':
        case 'brand':
        case 'material_body':
        case 'material_facade':
        case 'material_upholstery':
          state.filters = state.filters.filter(f => {
            f.data = f.data.filter(d => d !== action.payload.value)
            return !f.data.length ? false : true
          })
          break;
        case 'design':
          state.filters = state.filters.filter(f => f.name !== 'design')
          break;
        case 'width':
        case 'length':
        case 'height':
          state.filters = state.filters.filter(f => {
            if(f.name == 'size'){
              f.data = f.data.filter(d => d.name !== action.payload.name)
              
            }
            return !f.data.length ? false : true
          })
          return state  

      }
    },
		paginate:(state,action)=>{
			state.pagination.page = action.payload
		},
		sort:(state,action)=>{
			state.sort = action.payload
		}
		
  }
})

export const { checkbox,design,size,chips,paginate,sort } = filterSlice.actions

export const store = configureStore({
  reducer: filterSlice.reducer
})

window.store = store;
window.checkbox = checkbox


