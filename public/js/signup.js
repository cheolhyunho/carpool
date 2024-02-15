function init() {
  const form = document.getElementById('signup-form')
  form.addEventListener('submit', function (event) {
    event.preventDefault()
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirm-password').value

    if (password !== confirPassword) {
      alert('비밀번호가 일치하지 않습니다')
      return
    }

    console.log('이름:', name)
    console.log('이메일:', email)
    console.log('비밀번호:', password)
    console.log('비밀번호 확인:', confirmPassword)
  })
}

document.addEventListener('DOMContentLoaded', init)
