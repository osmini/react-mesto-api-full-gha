
// класс для работы с api яндекс практикума
class Api {

  constructor({ headers, baseUrl }){
    this._headers = headers;
    this._baseUrl = baseUrl
  }

  _checkResponse(res){
    if(res.ok){
      return res.json();
    }
    return Promise.reject('Ошибка запроса');
  };

  // получить данные о профиле с сервера
  getInfoUserForServer(){

    return fetch(this._baseUrl + '/users/me', {
    headers: this._headers,
  })
  .then(res => {
    return this._checkResponse(res);
    })
  };

  // изменить данные о профиле с сервера и загрузить на страницу сайта
  patchInfoUserForServer(date){

    return fetch(this._baseUrl + '/users/me' , {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({
        name: date.name,
        about: date.about
      })
    })
    .then(res => {
      return this._checkResponse(res);
    })
  }

  // изменить аватар
  patchAvatarForServer(avatar){

    return fetch(this._baseUrl + '/users/me/avatar', {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({
        avatar: avatar.avatar
      })
    })
    .then(res => {
      return this._checkResponse(res);
    })
  }

  // получить карточки с сервера
  getCardsForServer(){
    
    return fetch(this._baseUrl + '/cards', {
      headers: this._headers,
      })
      .then(res => {
        return this._checkResponse(res);
      })
  };

  // добавить новую карточку на сервер
  postCardsForServer(newCardDate){
  
    return fetch(this._baseUrl + '/cards', {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({
        name: newCardDate.name,
        link: newCardDate.link
      })
    })
    .then(res => {
      return this._checkResponse(res);
    })
  }

  // удаление карточки
  deleteCardForServer(cardId){
    
    return fetch(this._baseUrl + `/cards/${cardId}`, {
      method: 'DELETE',
      headers: this._headers,
    })
    .then(res => {
      return this._checkResponse(res);
    })
  } 

  //поставить лайк
  putLikeForServer(cardId){
    
    return fetch(this._baseUrl + `/cards/${cardId}/likes`, {
      method: 'PUT',
      headers: this._headers,
    })
    .then(res => {
      return this._checkResponse(res);
    })
  } 

  //убрать лайк
  deleteLikeForServer(cardId){
  
    return fetch(this._baseUrl + `/cards/${cardId}/likes`, {
      method: 'DELETE',
      headers: this._headers,
    })
    .then(res => {
      return this._checkResponse(res);
    })
  } 
}

const api = new Api({ 
  baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-63',
  headers: {
  authorization: 'c564ddc3-f58f-47cc-aac8-027be5fd7e89',
  'Content-Type': 'application/json'
}});

export default api;
