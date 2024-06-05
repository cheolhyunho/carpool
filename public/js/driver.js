const socket = io('/')
const headerContent = document.getElementById('header-content')
const mapContainer = document.getElementById('mapContainer')
const buttons = document.getElementById('buttons')
var bufferingElement = document.querySelector('.buffering')
var taxiIconElement = document.querySelector('.taxi-icon')
const logoutButton = document.getElementById('logout')
const finishDriveButton = document.getElementById('finishDriveButton')
const passengerModeButton = document.getElementById('PassengerMode')

var map, marker // 전역 변수로 선언
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude // 위도
    var lon = position.coords.longitude // 경도

    var mapContainer = document.getElementById('map'), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      }

    var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다

    // 마커 이미지의 주소입니다
    var imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png' // Kakao 내비게이션 스타일의 아이콘 URL로 변경
    var imageSize = new kakao.maps.Size(64, 69) // 마커 이미지의 크기
    var imageOption = { offset: new kakao.maps.Point(27, 69) } // 마커 이미지의 옵션, 마커의 좌표와 일치시킬 이미지 안의 좌표 설정

    // 마커 이미지를 생성합니다
    var markerImage = new kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imageOption,
    )

    // 마커가 표시될 위치입니다
    var markerPosition = new kakao.maps.LatLng(lat, lon)

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      position: markerPosition,
      image: markerImage, // 마커 이미지 설정
    })

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map)
  })
} else {
  // 사용자가 위치 정보를 허용하지 않은 경우의 처리
  alert('Geolocation을 지원하지 않는 브라우저입니다.')
}

function updateLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude
      var lon = position.coords.longitude
      var locPosition = new kakao.maps.LatLng(lat, lon)

      if (marker && map) {
        // 마커 위치를 갱신합니다
        marker.setPosition(locPosition)
        // 지도 중심을 현재 위치로 이동합니다
        map.setCenter(locPosition)
      }
    })
  }
}

// 5초마다 위치를 갱신합니다
setInterval(updateLocation, 5000)

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

socket.on('wantLocation', (matchedPath) => {
  if ('geolocation' in navigator) {
    console.log('wantLocation On 실행중')
    const oldMapContainer = document.getElementById('map')
    if (oldMapContainer) {
      oldMapContainer.remove()
    }
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
  socket.off('letsDrive')
  headerContent.remove()
  bufferingElement.remove()
  taxiIconElement.remove()
  console.log('letsDrive 이벤트 실행중')
  buttons.style.display = 'block'
  mapContainer.style.display = 'block'
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 9, // 지도의 확대 레벨
  }

  var map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다
  var geocoder = new kakao.maps.services.Geocoder()
  // 새로운 박스를 생성하여 데이터를 표시합니다

  var link = document.createElement('link')
  link.href =
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  var infoBox = document.createElement('div')
  infoBox.style.border = '1px solid black'
  infoBox.style.padding = '10px'
  infoBox.style.margin = '10px 0'
  infoBox.style.backgroundColor = '#f9f9f9'
  infoBox.style.zIndex = '1'
  infoBox.style.position = 'absolute'
  infoBox.style.top = '10px' // 원하는 위치로 조정
  infoBox.style.left = '10px' // 원하는 위치로 조정

  infoBox.style.fontFamily = "'Roboto', sans-serif"
  infoBox.style.borderRadius = '10px' // 부드러운 모서리

  // 데이터를 추출합니다
  var firstFare = matchedPath.firstFare || 0
  var secondFare = matchedPath.secondFare || 0
  var totalFare = firstFare + secondFare
  var totalDistance = matchedPath.totalDistance || 0
  var totalDuration = matchedPath.totalDuration || 0
  console.log('totalDistance:', totalDistance)

  // 정보를 표시합니다
  infoBox.innerHTML = `
      <h3>주행 정보</h3>
      <p id="driving_profit"><strong>주행 보수:</strong> ${totalFare}원</p>
      <p id="driving_distance"><strong>주행 거리:</strong> ${Math.round(
        totalDistance / 1000,
      )}km     </p>
      <p id="driving_duration"><strong>주행 시간:</strong> ${Math.round(
        totalDuration / 60,
      )}분</p>
      <button id="acceptButton" class="styled-button accept-button" >수락</button>
      <button id="rejectButton" class="styled-button reject-button">거절</button>
    `

  // 박스를 페이지에 추가합니다
  document.body.appendChild(infoBox)
  const rejectButton = document.getElementById('rejectButton')
  const acceptButton = document.getElementById('acceptButton')
  var positions = [
    {
      content:
        '<div id="passenger1" style="border-radius: 50px; padding: 5px;"">승객1 승차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.origin.lat,
        matchedPath.origin.lng,
      ),
    },
    {
      content:
        '<div id="passenger2" style="border-radius: 50px; padding: 5px;"">승객 하차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.destinationPoint.lat,
        matchedPath.destinationPoint.lng,
      ),
    },
    {
      content:
        '<div id="passenger3" style="border-radius: 50px; padding: 5px;"">승객2 승차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.firstWayPoint.lat,
        matchedPath.firstWayPoint.lng,
      ),
    },
    {
      content:
        '<div id="passenger4" style="border-radius: 50px; padding: 5px;">승객 하차</div>',
      latlng: new kakao.maps.LatLng(
        matchedPath.secondWayPoint.lat,
        matchedPath.secondWayPoint.lng,
      ),
    },
  ]
  searchDetailAddrFromCoords(positions[0], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[0].content +=
        '<div id="jibeon1" style="border-radius: 50px; padding: 5px;"">지번 주소 : ' +
        result[0].address.address_name +
        '</div>'
      updateInfowindowContent(0)
    }
  })
  searchDetailAddrFromCoords(positions[1], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[1].content +=
        '<div id="jibeon2" style="border-radius: 50px; padding: 5px;"">지번 주소 : ' +
        result[0].address.address_name +
        '</div>'
      updateInfowindowContent(1)
    }
  })
  searchDetailAddrFromCoords(positions[2], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[2].content +=
        '<div id="jibeon3" style="border-radius: 50px; padding: 5px;"">지번 주소 : ' +
        result[0].address.address_name +
        '</div>'
      updateInfowindowContent(2)
    }
  })
  searchDetailAddrFromCoords(positions[3], function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      positions[3].content +=
        '<div id="jibeon4" style="border-radius: 50px; padding: 5px;"">지번 주소 : ' +
        result[0].address.address_name +
        '</div>'
      updateInfowindowContent(3)
    }
  })
  async function fetchWaittingPayment() {
    try {
      const response = await fetch('matchedPath/waittingPayment')
      if (response.ok) {
        const html = await response.text()
        document.getElementById('waittingPaymentContainer').innerHTML = html
      } else {
        console.error(
          'Failed to fetch the waittingPayment page:',
          response.status,
        )
      }
    } catch (error) {
      console.error('Error fetching the waittingPayment page:', error)
    }
  }

  acceptButton.addEventListener('click', () => {
    buttons.style.display = 'none'
    socket.emit('imDriver', matchedPath, (message) => {
      alert(message)
    })
    // const currentOrigin = window.location.origin // "http://example.com"
    // const newPath = '/matchedPath/waittingPayment'

    // // 현재 URL에서 '/driver'를 제거
    // const newUrl = currentOrigin.replace('/driver', '') + newPath
    // window.location.href = newUrl
    const forRemoveMap = document.getElementById('mapContainer')
    forRemoveMap.remove()
    fetchWaittingPayment()
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
  console.log('Kakao SDK loades')
  if (typeof Kakao !== 'undefined') {
    console.log('Kakao:', Kakao)
    // 스크립트가 로드된 후에 Kakao를 초기화합니다.
    Kakao.init('a98664e9f599be2547e4095d1a9c907d')

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
  } else {
    console.error('Kakao is not defined')
  }
}

script.onerror = function () {
  console.error('Failed to load the Kakao SDK script')
}

document.body.appendChild(script)

socket.on('navigation', (matchedPath) => {
  console.log('navigation 이벤트 실행중')
  if (window.startNavigation) {
    window.startNavigation(matchedPath)
  } else {
    console.error('startNavigation function is not defined')
  }
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
