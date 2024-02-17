var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 10, // 지도의 확대 레벨
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

function sendPostRequest(lat, lon) {
  // API 엔드포인트 URL
  const apiUrl = 'http://localhost:5000/unmatched-paths'

  // POST 요청에 사용할 데이터
  const postData = {
    latitude: lat,
    longitude: lon,
    // 다른 필요한 데이터도 추가 가능
  }

  // fetch를 사용하여 POST 요청 보내기
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 다른 필요한 헤더도 추가 가능
    },
    body: postData,
  })
    .then((response) => {
      // 서버 응답이 성공인 경우
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      // JSON 형식으로 파싱된 응답 데이터 반환
      return response.json()
    })
    .then((data) => {
      // 성공적으로 데이터를 받아온 경우 처리
      console.log('API 응답 데이터:', data)
    })
    .catch((error) => {
      // 오류 처리
      console.error('API 요청 중 오류 발생:', error)
    })
}

function init() {
  if (navigator.geolocation) {
    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude, // 위도
        lon = position.coords.longitude // 경도

      var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
        message = '<div style="padding:5px;">여기에 계신가요?!</div>' // 인포윈도우에 표시될 내용입니다

      // 마커와 인포윈도우를 표시합니다
      displayMarker(locPosition, message)
    })
  } else {
    // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
      message = 'geolocation을 사용할수 없어요..'

    displayMarker(locPosition, message)
  }

  // 지도에 마커와 인포윈도우를 표시하는 함수입니다
}

document.addEventListener('DOMContentLoaded', init)

var triggerElement = document.getElementById('triggerButton') // Replace with the actual ID of the element you want to trigger the click event
triggerElement.addEventListener('click', function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude,
        lon = position.coords.longitude

      sendPostRequest(lat, lon)
    })
  } else {
    console.error('Geolocation is not supported.')
  }
})
