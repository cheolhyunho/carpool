function sendPost(userInfo) {
  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userInfo),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('user Model create Fail!')
      }
      return response.json()
    })
    .then((data) => {
      console.log('create Successful:', data)
      window.location.href = '/'
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function init() {
  const form = document.getElementById('signup-form')
  form.addEventListener('submit', function (event) {
    event.preventDefault()
    const username = document.getElementById('username').value
    const identityNumber = document.getElementById('identityNumber').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirm-password').value

    const userInfo = {
      username,
      identityNumber,
      email,
      password,
      confirmPassword,
    }
    sendPost(userInfo)
  })
}

document.addEventListener('DOMContentLoaded', init)
