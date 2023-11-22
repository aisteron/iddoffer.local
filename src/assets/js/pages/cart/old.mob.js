if(mob){

			
			
			prods.forEach(prod => {

				let final_discount = (prod.discount - user_discount) > 0 ? prod.discount : user_discount
				let price = final_discount ? ((100-final_discount) / 100 * prod.price).toFixed(2) : prod.price
				
				str += `
					<div class="item" key="${prod.key}" data-id="${prod.id}">
						
						<ul class="left">
							<li class="name">Наименование</li>
							<li class="price">Цена, <span class="cur">BYN</span></li>
							<li class="prod_discount">Скидка продукта</li>
							<li class="user_discount">Скидка пользователя</li>
							<li class="final_discount">Скидка итоговая</li>
							<li class="final_price">Цена со скидкой, <span class="cur">р.</span></li>
							<li class="count">Количество</li>
							<li class="itog">Итого, <span class="cur">р.</span></li>
						</ul>

						<ul class="right">

							<li class="name"><a href="${cfg.host}/${prod.uri}">${prod.name}</a></li>
							<li class="price">${prod.price}</li>
							<li class="prod_discount">${prod.discount ? prod.discount+`%`: "-"}</li>
							<li class="user_discount">${user_discount ? user_discount+`%` : "-"}</li>
							<li class="final_discount">${final_discount ? final_discount+`%` : "-"}</li>
							<li class="final_price">${price}</li>
							
							<li class="count">

								<div class="wrap">
									<img class="down" src="/assets/img/icons/minus.svg" width="23" heigth="23">
									<input type="number" value="${prod.count}">
									<img class="up" src="/assets/img/icons/plus.svg" width="23" heigth="23">
								</div>
								<img class="remove" src="/assets/img/icons/trash.svg" width="18" height="17">

							</li>

							<li class="itog">${price * prod.count}</li>
							<li>
								<ul class="stats">
									
									<li class="colors"> <span class="name">Цвета:</span> </li>
									
									<li class="material"> <span class="name">Материал фасада:</span> </li>

									<li class="comment ${prod.txt ? `open`:''}" >

										<span class="name">Комментарий:</span>
										<button>
											<img src="/assets/img/icons/write.svg" width="15" height="15">
											<span>Написать</span>
										</button>

										<textarea>${prod.txt ? prod.txt : ""}</textarea>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				`
			})
			mob.innerHTML = str
		}