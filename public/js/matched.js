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

var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.2095934, 126.9817136), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  }
var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다

socket.on('failedPay', () => {
  alert('상대방 결제문제로 매칭이 취소되었습니다.')
})

socket.on('hereIsRealTimeLocation', (data) => {
  console.log('hereIsRealTimeLocation 실행중')

  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(data.latitude, data.longitude), // 지도의 중심좌표
      level: 8, // 지도의 확대 레벨
    }
  map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다

  var markerPosition = new kakao.maps.LatLng(data.latitude, data.longitude)
  var marker = new kakao.maps.Marker({
    position: markerPosition,
  })
  marker.setMap(map)
  map.panTo(markerPosition)
})
