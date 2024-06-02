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
        return response.json().then((errorData) => {
          throw new Error(errorData.message.join(', '))
        })
      }
      return response.text()
    })
    .then((data) => {
      console.log(data)
      if (data.length < 25) {
        alert(data)
      } else {
        console.log('create Successful:', data)
        window.location.href = '/'
      }
    })
    .catch((error) => {
      alert(error.message)
      console.error('Error:', error)
    })
}

function init() {
  const form = document.getElementById('signup-form')
  form.addEventListener('submit', async function (event) {
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
