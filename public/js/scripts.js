function sendCoordinatesToBackend(latitude, longitude) {
  // 좌표값을 서버로 전송하는 AJAX 요청
  $.ajax({
    type: 'POST', // HTTP 요청 방식: POST
    url: '/unmatchedPath', // 요청을 보낼 URL
    data: {
      // 전송할 데이터
      lat: latitude, // 위도
      lng: longitude, // 경도
    },
    success: function (response) {
      // 요청 성공 시 실행되는 콜백 함수
      console.log('좌표값을 성공적으로 전송했습니다.')
    },
    error: function (xhr, status, error) {
      // 요청 실패 시 실행되는 콜백 함수
      console.error('좌표값 전송에 실패했습니다:', error)
    },
  })
}
var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  }
var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다

function displayMarker(locPosition, message) {
  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
  })

  var iwContent = message, // 인포윈도우에 표시할 내용
    iwRemoveable = true

  // 인포윈도우를 생성합니다
  var infowindow = new kakao.maps.InfoWindow({
    content: iwContent,
    removable: iwRemoveable,
  })

  // 인포윈도우를 마커위에 표시합니다
  infowindow.open(map, marker)

  // 지도 중심좌표를 접속위치로 변경합니다
  map.setCenter(locPosition)
}

// init 함수 수정
function init() {
  if (navigator.geolocation) {
    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude, // 위도
        lon = position.coords.longitude // 경도

      const coordinateData = {
        lat,
        lng: lon,
      }

      fetch('/unmatchedPath', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coordinateData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('unmatchedPath Model create Fail!')
          }
          return response.json()
        })
        .then((data) => {
          console.log('create Successful:', data)
          // 로그인에 성공하면 필요한 작업을 수행합니다.
        })
        .catch((error) => {
          console.error('Error:', error)
          // 로그인에 실패하면 사용자에게 메시지를 표시하거나 다른 작업을 수행합니다.
        })

      var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
        message = '<div style="padding:5px;">여기에 계신가요?!</div>' // 인포윈도우에 표시될 내용입니다

      // 마커와 인포윈도우를 표시합니다
      displayMarker(locPosition, message)

      // 좌표를 백엔드로 전송합니다
      sendCoordinatesToBackend(lat, lon)
    })
  } else {
    // HTML5의 GeoLocation을 사용할 수 없을 때 마커 표시 위치와 인포윈도우 내용을 설정합니다
    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
      message = 'geolocation을 사용할 수 없어요..'

    displayMarker(locPosition, message)
  }
}

document.addEventListener('DOMContentLoaded', init)
