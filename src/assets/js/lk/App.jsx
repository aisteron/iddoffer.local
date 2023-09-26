import "./App.sass";
import React, { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { fetch_user_thunk, store } from "./store";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "./components/Form.jsx";

export default function App() {

	const dispatch = useDispatch()
	
	store.subscribe(_ => console.log(store.getState()))
	
	useEffect(()=>{
		dispatch(fetch_user_thunk())
		
	},[])
	
	
	return (
		<>
			<Loader/>
			<Header/>
			<Form />
		</>
  );
}


export const Loader = () => {

	const isLoading = useSelector(state => state.loading)
	return isLoading ? ('Загружается') : null

}