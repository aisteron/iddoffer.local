import React, { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cfg, xml } from "../../libs"
import {user_upload_file,user_remove_file, user_rename} from '../store';

export const UserForm = () => {
	const user = useSelector(state => state.data)
	const dispatch = useDispatch()
	const [file, setFile] = useState(null)
	const [error, setError] = useState()
	const [loading, setLoading] = useState(false)
	const fileInputRef = useRef(null)
	if(!user?.username) return
	
	const handleFile = e => {
		setError(null)
		
		let file = e.target.files[0]
		let filetype = false
		if(!file){ setFile(null); return}

		if((file.size / 1024 / 1024) > 5){
			setError("Файл больше 5 Мб")
			return
		}

		switch(file.type){
			case 'image/jpeg':
			case 'application/pdf':
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			case 'application/msword':
			case 'application/zip':
				filetype = true;
				break;

		}

		if(!filetype){
			setError("Такой файл не поддерживается");
			return;
		}
		setFile(file)
		
	}

	const uploadFile = async e => {
		let access_token = localStorage.getItem("acess_token")

		return new Promise((resolve, reject) => {
			var formData = new FormData();
			formData.append("myfile", file);
			formData.append("action", "user_upload_file");
			formData.append("access_token", access_token);
			

			var xhr = new XMLHttpRequest();
			xhr.open('POST', `${cfg.host}/api/user`, true);

			xhr.onload = function () {
				var status = xhr.status;
				let resp = JSON.parse(xhr.response)
				setLoading(false)
				setFile(null)

				if (status == 200) {
					resolve(resp);
					dispatch(user_upload_file(resp));
					fileInputRef.current.value = ''
				} else {
					setError(resp.message)
					reject(resp);
				}
				
			};
			setLoading(true)
			xhr.send(formData);
		})
		

	}

	const removeFile = async e => {

		let obj = { name: e.target.previousElementSibling.innerHTML}
		process.env.NODE_ENV && (obj.userid = 2);
		
		let res = await xml("user_remove_file", obj, '/api/user') // name, success
		res = JSON.parse(res);

		if(!res.success){
			setError(res.message)
		} else {
			dispatch(user_remove_file(res.name));
		}
	}


	return(
		<div className="userform">
			<input type="text" 
			className="fullname" 
			defaultValue={user.fullname} 
			placeholder="Полное имя" 
			onBlur={e=>dispatch(user_rename(e.target.value))}/>
			<input type="email" className="email" defaultValue={user.email} disabled/>
			
			<label>
				<input type="text" className="email" 
				defaultValue={user.discount ? user.discount: 'скидки нет'} disabled/>
				{user.discount ? <span className="percent">%</span> : ''}
			</label>

			<span className="status">
				<span>Статус:</span>
				{user.approved
				? <span className="approved">Документы проверены</span>
				: <span className="not_approved">Документы не проверены</span>
			}
			</span>

			<ul className="files">
				{user.files ? JSON.parse(user.files).map((el,i) => {
					return(
						<li key={i}>
							<a href={el.path} download>{el.name}</a>
							<img src="/assets/img/icons/close_file.svg" className="remove" onClick={e=>removeFile(e)}/>
						</li>)
				}): <h5>Нет загруженных файлов</h5>}
			</ul>

			{error && <span className="error">{error}</span>}
			<input type="file" onChange={e=>handleFile(e)} ref={fileInputRef}/>
			{(file && !error)
				? <button onClick={e=>uploadFile(e)}
					className={`upload ${loading ? 'loading': ''}`}>Загрузить на сервер</button>
				: ''}
			
			<div className="comment">
				<p>Размер файла до 5 Мб</p>
				<p>Типы файлов: pdf, doc, docx, jpg, zip</p>
			</div>
			


		</div>
	)
}

