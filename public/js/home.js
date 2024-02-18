document.addEventListener('DOMContentLoaded', function () {
  const logoutButton = document.getElementById('logoutButton')
  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      fetch('/signup/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((data) => {
          if (data) {
            window.location.href = '/'
          }
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    })
  }
})
