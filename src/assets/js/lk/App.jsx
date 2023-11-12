import "./App.sass";
import React, { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { fetch_user_thunk, set_mode, store,check_expired_token_thunk } from "./store";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "./components/Form.jsx";
import { UserForm } from "./components/UserForm.jsx";
import { AdminForm } from "./components/AdminForm.jsx";


export default function App() {

	const dispatch = useDispatch()
	
	store.subscribe(_ => console.log(store.getState()))

	const queryParameters = new URLSearchParams(window.location.search)
  const token = queryParameters.get("token")
	const activate_token = queryParameters.get("activate_token")


	useEffect(()=>{

		if(token) { dispatch(check_expired_token_thunk(token, 'repair')); return }
		if(activate_token) { dispatch(check_expired_token_thunk(activate_token, 'activate')); return}

		dispatch(fetch_user_thunk())
		
	},[])
	
	
	return (
		<>
			<Loader/>
			<Header/>
			<Form />
			<UserForm />
			<AdminForm />
			<div className="scripts-area"></div>
		</>
  );
}


export const Loader = () => {

	const isLoading = useSelector(state => state.loading)
	return isLoading ? ('Загружается') : null

}
