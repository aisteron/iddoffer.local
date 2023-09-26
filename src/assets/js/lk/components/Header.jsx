import React from "react"
import { useSelector } from "react-redux"

export const Header = () => {
	const user = useSelector(state => state.data)
	
	if(!user?.username) return
	
	return(
		<p>header</p>
	)
}