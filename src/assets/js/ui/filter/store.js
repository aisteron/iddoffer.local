import { createSlice, configureStore } from '@reduxjs/toolkit'


const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    filters: [],
    page: 1,
    perpage: +document.head.querySelector('[name="perpage"]')?.getAttribute("content")
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

      //let res = state.filters.map(f => f.name == action.payload.name && (f.data = action.payload.data));
      
      //res.length == 0 && state.filters.push(action.payload)

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
    size:(state,action) =>{
      console.log(action.payload)
    }
  }
})

export const { checkbox,design,size } = filterSlice.actions

export const store = configureStore({
  reducer: filterSlice.reducer
})

