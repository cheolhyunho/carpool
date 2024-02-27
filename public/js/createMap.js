const currentAddressSettingButton = document.getElementById('sendButton')
const destinationAddressInput = document.getElementById('destinationAddress')
const searchDestinationButton = document.getElementById(
  'searchDestinationButton',
)
const setDestinationButton = document.getElementById('setDestinationButton')
function sendPost(coordinateData) {
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
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function setDestination(destinationPoint) {
  fetch('/unmatchedPath/setDes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(destinationPoint),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('unmatchedPath destinationPoint Fetch Fail')
      }
      return response.json()
    })
    .then((data) => {
      console.log('create Successful:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
//주소로 목적지를 정하는 함수
function updateMapWithDestination(destinaitionAddress) {
  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    }

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption)

  // 주소-좌표 변환 객체를 생성합니다
  var geocoder = new kakao.maps.services.Geocoder()

  // 주소로 좌표를 검색합니다
  geocoder.addressSearch(
    JSON.stringify(destinaitionAddress),
    function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x)

        // 결과값으로 받은 위치를 마커로 표시합니다
        var marker = new kakao.maps.Marker({
          map: map,
          position: coords,
        })

        // 인포윈도우로 장소에 대한 설명을 표시합니다
        var infowindow = new kakao.maps.InfoWindow({
          content:
            '<div style="width:150px;text-align:center;padding:6px 0;">목적지</div>',
        })
        infowindow.open(map, marker)

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.setCenter(coords)
        const destinationPoint = {
          lat: result[0].y,
          lng: result[0].x,
        }
        setDestinationButton.addEventListener('click', function () {
          setDestination(destinationPoint)
        })
      }
    },
  )
}

var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.2095934, 126.9817136), // 지도의 중심좌표
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

      var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
        message = '<div style="padding:5px;">여기에 계신가요?!</div>' // 인포윈도우에 표시될 내용입니다

      // 마커와 인포윈도우를 표시합니다
      displayMarker(locPosition, message)
    })
  } else {
    // HTML5의 GeoLocation을 사용할 수 없을 때 마커 표시 위치와 인포윈도우 내용을 설정합니다
    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
      message = 'geolocation을 사용할 수 없어요..'

    displayMarker(locPosition, message)
  }
}

document.addEventListener('DOMContentLoaded', init)
currentAddressSettingButton.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude,
      lng = position.coords.longitude
    const coordinateData = {
      lat,
      lng,
    }
    sendPost(coordinateData)
  })
})

searchDestinationButton.addEventListener('click', function () {
  // 인풋박스에서 입력된 도착지 주소 가져오기
  var destinationAddress = destinationAddressInput.value

  // 주소를 이용하여 지도를 갱신하는 함수 호출
  updateMapWithDestination(destinationAddress)
})
