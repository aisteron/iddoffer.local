import "./App.sass";
import React from "react";
import { Header } from "./components/Header.jsx";

export default function App() {
	return (
		<>
			<Header/>
			<div className="App">
				<h1>Hello CodeSandbox</h1>
				<h2>Start editing to see some magic happen</h2>
			</div>
		</>
  );
}