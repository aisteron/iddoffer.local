import React from "react"
import { useSelector } from "react-redux"

export const AdminForm = () => {
	const mode = useSelector(state => state.mode)
	if(mode !== 'admin') return
	return(
		<p>Admin</p>
	)
}