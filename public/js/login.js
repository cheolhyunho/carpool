function sendLoginInfo(loginInfo) {
  fetch('/signup/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginInfo),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('로그인실패')
      }
      return response.json()
    })
    .then((data) => {
      console.log('로그인성공:', data)
      window.location.href = '/unmatchedPath'
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function init() {
  const form = document.getElementById('login-form')
  form.addEventListener('submit', function (event) {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const loginInfo = {
      email,
      password,
    }
    sendLoginInfo(loginInfo)
  })
}

document.addEventListener('DOMContentLoaded', init)
