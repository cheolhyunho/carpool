const socket = io('/')
fetch('/unmatchedPath/userId', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('')
    }
    return response.json()
  })
  .then((data) => {
    socket.emit('socketIdSave', data)
  })
  .catch((error) => {
    console.error('UserId 가져오기 실패:', error)
  })

socket.on('failedPay', () => {
  alert('상대방 결제문제로 매칭이 취소되었습니다.')
})
