const socket = io('/')
const headerContent = document.getElementById('header-content')
const passangerButton = document.getElementById('passenger-button')
const mapContainer = document.getElementById('mapContainer')
const buttons = document.getElementById('buttons')
const rejectButton = document.getElementById('rejectButton')
const acceptButton = document.getElementById('acceptButton')
var bufferingElement = document.querySelector('.buffering')
var taxiIconElement = document.querySelector('.taxi-icon')
const logoutButton = document.getElementById('logout')
const finishDriveButton = document.getElementById('finishDriveButton')
const passengerModeButton = document.getElementById('PassengerModee')

passengerModeButton.addEventListener('click', function () {
  window.location.href = window.location.origin + '/unmatchedPath'
})

fetch('/unmatchedPath/userId', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((reponse) => {
    if (!reponse.ok) {
      throw new Error('서버에러')
    }
    return reponse.json()
  })
  .then((data) => {
    socket.emit('driverMode', data)
  })
  .catch((error) => {
    console.error(error)
  })

passangerButton.addEventListener('click', function () {
  window.location.href = window.location.origin + '/unmatchedPath'
})

socket.on('wantLocation', (matchedPath) => {
  if ('geolocation' in navigator) {
    console.log('wantLocation On 실행중')
    navigator.geolocation.getCurrentPosition(function (position) {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const data = {
        lat: latitude,
        lng: longitude,
        matchedPath: matchedPath,
      }
      console.log('hereIsLocation 이벤트 실행전')
      socket.emit('hereIsLocation', data)
      console.log('hereIsLocation 이벤트 실행후')
    })
  } else {
    alert('이 브라우저에서는 Geolocation 을 지원하지 않습니다.')
  }
})

socket.on('letsDrive', function (matchedPath) {
  headerContent.remove()
  bufferingElement.remove()
  taxiIconElement.remove()
  console.log('letsDrive 이벤트 실행중')
  buttons.style.display = 'block'
  mapContainer.style.display = 'block'
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 11, // 지도의 확대 레벨
  }

  var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다
  var geocoder = new kakao.maps.services.Geocoder()

  var positions = [
    {
      content: '<div>승객1 승차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.origin.lat,
        matchedPath.origin.lng,
      ),
    },
    {
      content: '<div>승객 하차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.destinationPoint.lat,
        matchedPath.destinationPoint.lng,
      ),
    },
    {
      content: '<div>승객2 승차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.firstWayPoint.lat,
        matchedPath.firstWayPoint.lng,
      ),
    },
    {
      content: '<div>승객 하차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.secondWayPoint.lat,
        matchedPath.secondWayPoint.lng,
      ),
    },
  ]
  searchDetailAddrFromCoords(positions[0], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[0].content +=
        '<div>지번 주소 : ' + result[0].address.address_name + '</div>'
      updateInfowindowContent(0)
    }
  })
  searchDetailAddrFromCoords(positions[1], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[1].content +=
        '<div>지번 주소 : ' + result[0].address.address_name + '</div>'
      updateInfowindowContent(1)
    }
  })
  searchDetailAddrFromCoords(positions[2], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[2].content +=
        '<div>지번 주소 : ' + result[0].address.address_name + '</div>'
      updateInfowindowContent(2)
    }
  })
  searchDetailAddrFromCoords(positions[3], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[3].content +=
        '<div>지번 주소 : ' + result[0].address.address_name + '</div>'
      updateInfowindowContent(3)
    }
  })

  acceptButton.addEventListener('click', () => {
    buttons.style.display = 'none'
    socket.emit('imDriver', matchedPath, (message) => {
      alert(message)
    })
  })
  rejectButton.addEventListener('click', () => {
    location.reload()
  })

  function updateInfowindowContent(index) {
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: positions[index].latlng, // 마커의 위치
      status: true,
    })

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: positions[index].content, // 인포윈도우에 표시할 내용
    })

    infowindow.open(map, marker)

    kakao.maps.event.addListener(marker, 'click', function () {
      // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
      if (marker.status == true) {
        infowindow.open(map, marker)
        marker.status = false
      } else {
        infowindow.close()
        marker.status = true
      }
    })
  }

  function searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    geocoder.coord2Address(
      coords.latlng.getLng(),
      coords.latlng.getLat(),
      callback,
    )
  }
})

socket.on('alreadyMatched', () => {
  alert('이미 택시가 매칭되었습니다')
  location.reload()
})

socket.on('failedPay', () => {
  alert('결제문제로 매칭이 취소되었습니다.')
  location.reload()
})

var script = document.createElement('script')

script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js'
script.integrity =
  'sha384-kDljxUXHaJ9xAb2AzRd59KxjrFjzHa5TAoFQ6GbYTCAG0bjM55XohjjDT7tDDC01'
script.crossOrigin = 'anonymous'

script.onload = function () {
  // 스크립트가 로드된 후에 Kakao를 초기화합니다.
  Kakao.init('86ae03c1d2c30d0b0a969db803f5a333')
  console.log('Kakao:', Kakao)
  // Kakao 초기화 후에 startNavigation 함수를 설정합니다.
  window.startNavigation = function (matchedPath) {
    console.log('startNavigation 함수 실행중')
    Kakao.Navi.start({
      name: '도착지',
      x: matchedPath.destinationPoint.lng,
      y: matchedPath.destinationPoint.lat,
      coordType: 'wgs84',
      viaPoints: [
        {
          name: '경유지1',
          x: matchedPath.origin.lng,
          y: matchedPath.origin.lat,
        },
        {
          name: '경유지2',
          x: matchedPath.firstWayPoint.lng,
          y: matchedPath.firstWayPoint.lat,
        },
        {
          name: '경유지3',
          x: matchedPath.secondWayPoint.lng,
          y: matchedPath.secondWayPoint.lat,
        },
      ],
    })
  }
}

document.body.appendChild(script)
socket.on('navigation', (matchedPath) => {
  console.log('navigation event on')
  window.startNavigation(matchedPath)
})

socket.on('updateLocation', (matchedPath) => {
  try {
    console.log('updateLocation 실행중')
    navigator.geolocation.getCurrentPosition(function (position) {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const data = {
        lat: latitude,
        lng: longitude,
        matchedPath: matchedPath,
      }
      console.log(matchedPath)
      socket.emit('realTimeLocation', data)
    })
    finishDriveButton.addEventListener('click', () => {
      socket.emit('finishDrive')
      window.location.href = window.location.origin + '/driver'
    })
  } catch (error) {
    console.error(error)
  }
})

logoutButton.addEventListener('click', function () {
  fetch('/signup/logout', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('')
      }
      return
    })
    .then(() => {
      console.log('Successful')
      window.location.href = '/'
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
