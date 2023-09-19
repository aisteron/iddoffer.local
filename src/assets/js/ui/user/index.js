import { qs, xml } from "../../libs"
import { store, mode } from "./store"

export function User(){
	
	store.subscribe(_=>{
		let state = store.getState()
		console.log(state)
		if(state.open){
			if(state.mode == 'auth') {
				user.draw_auth()
				user.listeners()
			}
			if(state.mode == 'reg') {
				user.draw_reg()
				user.listeners()
			}
			if(state.mode == 'forgot'){
				user.draw_forgot()
				user.listeners()
			}
		} else {
			qs('.user_modal').innerHTML = ''
		}
	})
		
	
	let icon = qs('.actions .user img')
	if(!icon) return

	if(!qs('.actions .user .user_modal'))
		qs('.actions .user img')
			.insertAdjacentHTML('afterend',`<div class="user_modal"></div>`)

	icon.addEventListener("click", async event => {
		
		let u = await user.get_user()
		
		if(u.username == '(anonymous)'){
			store.dispatch(mode("auth"))
		}

	})
	qs('.user_modal').classList.add('open')
	user.draw_auth()
	user.listeners()
}

const user = {
	async get_user(){ return await xml("get_current_user",null, '/api/user').then(r => JSON.parse(r))
	},
	async login(obj){
		// console.log(0)
		// let obj = {
		// 	username: "timotheus@list.ru",
		// 	password: "12345678"
		// }
		// xml("login",obj, '/api/user')

		//user.get_user()
	},
	draw_auth(){
		let str = `
			<form class="auth">

				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="pswd" placeholder="Password">
					<span class="error"></span>
				</label>

				<div class="buttons">
					<button class="transparent reg" type="button">
						Регистрация
					</button>
					<button class="regular" type="submit">
						Войти
					</button>
				</div>

				<div class="forgot">
					<span>Забыли пароль?</span>
				</div>

			</form>
		`
		qs('.user_modal').innerHTML = str
	},
	draw_reg(){
		let mode = store.getState().mode
		let str = `
			<form class="reg">

				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="pswd" placeholder="Password">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="repeat_pswd" placeholder="Repeat password">
					<span class="error"></span>
				</label>

				<div class="buttons">
					<button class="regular" type="submit">
						Регистрация
					</button>
					<button class="transparent" type="button">
						Войти
					</button>
				</div>


			</form>
		`
		qs('.user_modal').innerHTML = str
		

	},
	draw_forgot(){
		let str = `
			<form class="forgot">
				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>
				<div class="buttons">
					<button class="regular" type="submit">
						Отправить пароль на почту
					</button>
					<button class="transparent back" type="button">
						Назад
					</button>
				</div>	

			</form>`
		qs('.user_modal').innerHTML = str	
	},

	listeners(){

		let state = store.getState()
		
		if(state.mode == 'auth'){

			qs('button.reg').addEventListener("click", event => {
				event.preventDefault();
				store.dispatch(mode("reg"))
			})
			
			// qs('button.regular').addEventListener("click", event => {
			// 	event.preventDefault()
			// 	console.log(0)
			// })
			qs('form.auth').addEventListener("submit", event => {
				event.preventDefault()
				console.log(0)
			})
		}


		if(state.mode == "reg"){
			qs('.buttons .transparent').addEventListener("click", _ =>{
				store.dispatch(mode("auth"))
			})
			qs('form.reg').addEventListener("sumbit", event => {
				event.preventDefault()
				console.log(0)
			})
		}

		if(qs('.forgot span')){
			qs('.forgot span').addEventListener("click", _ =>
			store.dispatch(mode("forgot")))
		}

		if(qs('form.forgot button.back')){
			qs('form.forgot button.back').addEventListener("click", _ => 
			store.dispatch(mode("auth")))
		}
	}
}