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

var mapContainer = document.getElementById('map') // 지도를 표시할 div
mapOption = {
  center: new kakao.maps.LatLng(37.2095934, 126.9817136), // 지도의 중심좌표
  level: 3, // 지도의 확대 레벨
}
var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다
var markers = []
var clusterer = new kakao.maps.MarkerClusterer({
  map: map,
  markers: markers,
  gridSize: 35,
  averageCenter: true,
  minLevel: 6,
  disableClickZoom: true,
  styles: [
    {
      width: '53px',
      height: '52px',
      background: 'url(cluster.png) no-repeat',
      color: '#fff',
      textAlign: 'center',
      lineHeight: '54px',
    },
  ],
})

socket.on('location', (unmatchedPath) => {
  console.log('탑승위치표시')
  var markerPosition = new kakao.maps.LatLng(
    unmatchedPath.startingPoint.lat,
    unmatchedPath.startingPoint.lng,
  )
  var marker = new kakao.maps.Marker({
    position: markerPosition,
    text: '탑승위치',
  })
  marker.setMap(map)
  map.setCenter(markerPosition)

  var iwContent = '<div style="padding:5px;">탑승위치</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
    iwPosition = new kakao.maps.LatLng(33.450701, 126.570667) //인포윈도우 표시 위치입니다
  var infowindow = new kakao.maps.InfoWindow({
    position: iwPosition,
    content: iwContent,
  })
  infowindow.open(map, marker)
  console.log('location 실행')
})

socket.on('hereIsRealTimeLocation', (data) => {
  console.log('hereIsRealTimeLocation 실행중')
  var imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 마커이미지의 주소입니다
    imageSize = new kakao.maps.Size(64, 69), // 마커이미지의 크기입니다
    imageOption = { offset: new kakao.maps.Point(27, 69) } // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

  // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
  var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)

  var markerPosition = new kakao.maps.LatLng(data.lat, data.lng)

  var marker = new kakao.maps.Marker({
    position: markerPosition,
    image: markerImage,
  })
  clusterer.clear()
  clusterer.addMarker(marker)
})

socket.on('finishTracking', () => {
  console.log('finishTracking 실행중')
  socket.emit('deleteUnmatchedPathAndEtc')
})

socket.on('delteSocketIdAndEtc', () => {
  window.location.href = window.location.origin + '/unmatchedPath'
})
