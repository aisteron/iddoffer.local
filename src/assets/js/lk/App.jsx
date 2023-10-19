import "./App.sass";
import React, { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { fetch_user_thunk, set_mode, store,check_expired_token_thunk } from "./store";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "./components/Form.jsx";


export default function App() {

	const dispatch = useDispatch()
	
	store.subscribe(_ => console.log(store.getState()))

	const queryParameters = new URLSearchParams(window.location.search)
  const token = queryParameters.get("token")
	
	// удалить search param token when reset password
	
	useEffect(()=>{
		token
		//? dispatch(set_mode("reset"))
		? dispatch(check_expired_token_thunk(token))
		: dispatch(fetch_user_thunk())
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
