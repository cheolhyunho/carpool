const socket = io('/')
const currentAddressSettingButton = document.getElementById('sendButton')
const destinationAddressInput = document.getElementById('destinationAddress')
const searchDestinationButton = document.getElementById(
  'searchDestinationButton',
)
const originAddressInput = document.getElementById('originAddress')
const searchOriginButton = document.getElementById('searchOriginButton')
const setDestinationButton = document.getElementById('setDestinationButton')
const setOriginButton = document.getElementById('setOriginButton')
const matchingButton = document.getElementById('matching')
const logoutButton = document.getElementById('logout')
const modeButton = document.getElementById('DriverMode')
const boxAndButton = document.getElementById('boxAndButton')
const placesListBox = document.getElementById('placesList')
const paginationBox = document.getElementById('pagination')

modeButton.addEventListener('click', function () {
  window.location.href = window.location.origin + '/driver'
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
      socket.emit('deleteMyUnmatchedPath', data, (user) => {
        console.log('수신완료:', user)
      })
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
      console.log(error)
    })
})

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
      originAddressInput.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'
      alert('출발지가 설정되었습니다.')
    })
    .catch((error) => {
      console.error('Error:', error)
      alert('문제가 발생했습니다. 다시 시도해주세요')
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
      destinationAddressInput.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'
      alert('목적지가 설정되었습니다.')
    })
    .catch((error) => {
      console.error('Error:', error)
      alert('혹시 출발지와의 거리가 너무 가까운가요? 다시 한번 시도해보세요')
    })
}
originAddressInput.addEventListener('click', function () {
  originAddressInput.style.backgroundColor = 'white'
})
destinationAddressInput.addEventListener('click', function () {
  destinationAddressInput.style.backgroundColor = 'white'
})

function handleButtonClick(event) {
  // 클릭된 버튼의 부모 요소인 리스트 아이템을 찾습니다
  var listItem = event.target.closest('.item')
  // 리스트 아이템에서 주소 정보를 찾습니다
  var addressSpan = listItem.querySelector('.road')
  var destinationAddressInput = document.getElementById('destinationAddress')
  placesListBox.innerHTML = ''
  paginationBox.innerText = ''
  // 주소 정보가 있는 경우에만 처리합니다
  if (addressSpan) {
    // 주소 정보를 가져와서 인풋박스에 설정합니다
    destinationAddressInput.value = addressSpan.textContent
    updateMapWithDestination(destinationAddressInput.value)
  }
}

function handleButtonClick2(event) {
  // 클릭된 버튼의 부모 요소인 리스트 아이템을 찾습니다
  var listItem = event.target.closest('.item')
  // 리스트 아이템에서 주소 정보를 찾습니다
  var addressSpan = listItem.querySelector('.road')
  var originAddressInput = document.getElementById('originAddress')
  placesListBox.innerHTML = ''
  paginationBox.innerText = ''
  // 주소 정보가 있는 경우에만 처리합니다
  if (addressSpan) {
    // 주소 정보를 가져와서 인풋박스에 설정합니다
    originAddressInput.value = addressSpan.textContent
    setOriginPoint(originAddressInput.value)
  }
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
      } else {
        var markers = []

        var ps = new kakao.maps.services.Places()

        // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
        var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })

        // 키워드로 장소를 검색합니다
        searchPlaces()

        // 키워드 검색을 요청하는 함수입니다
        function searchPlaces() {
          var keyword = document.getElementById('destinationAddress').value

          if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!')
            return false
          }

          // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
          ps.keywordSearch(keyword, placesSearchCB)
        }

        // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
        function placesSearchCB(data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {
            // 정상적으로 검색이 완료됐으면
            // 검색 목록과 마커를 표출합니다

            displayPlaces(data)

            // 페이지 번호를 표출합니다
            displayPagination(pagination)
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.')
            return
          } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.')
            return
          }
        }

        // 검색 결과 목록과 마커를 표출하는 함수입니다
        function displayPlaces(places) {
          var listEl = document.getElementById('placesList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment(),
            bounds = new kakao.maps.LatLngBounds(),
            listStr = ''

          // 검색 결과 목록에 추가된 항목들을 제거합니다
          removeAllChildNods(listEl)

          // 지도에 표시되고 있는 마커를 제거합니다
          removeMarker()

          for (var i = 0; i < places.length; i++) {
            // 마커를 생성하고 지도에 표시합니다
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
              marker = addMarker(placePosition, i),
              itemEl = getListItem(i, places[i]) // 검색 결과 항목 Element를 생성합니다

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition)

            // 마커와 검색결과 항목에 mouseover 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
            ;(function (marker, title) {
              kakao.maps.event.addListener(marker, 'mouseover', function () {
                displayInfowindow(marker, title)
              })

              kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close()
              })

              itemEl.onmouseover = function () {
                displayInfowindow(marker, title)
              }

              itemEl.onmouseout = function () {
                infowindow.close()
              }
            })(marker, places[i].place_name)

            fragment.appendChild(itemEl)
          }

          // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
          listEl.appendChild(fragment)
          menuEl.scrollTop = 0

          // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
          map.setBounds(bounds)
        }

        // 검색결과 항목을 Element로 반환하는 함수입니다
        function getListItem(index, places) {
          var el = document.createElement('li'),
            itemStr =
              '<span class="markerbg marker_' +
              (index + 1) +
              '"></span>' +
              '<div class="info">' +
              '   <h5>' +
              places.place_name +
              '</h5>'

          if (places.road_address_name) {
            itemStr +=
              '    <span class="road">' +
              places.road_address_name +
              '</span>' +
              '   <button id = "arriveButton">도착</button>' +
              '   <span class="jibun gray">' +
              places.address_name +
              '</span>'
          } else {
            itemStr += '    <span>' + places.address_name + '</span>'
          }

          itemStr +=
            '  <span class="tel">' + places.phone + '</span>' + '</div>'

          el.innerHTML = itemStr
          el.className = 'item'
          var arriveButton = el.querySelector('#arriveButton')
          if (arriveButton) {
            arriveButton.addEventListener('click', handleButtonClick)
          }
          return el
        }

        // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
        function addMarker(position, idx, title) {
          var imageSrc =
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
            imgOptions = {
              spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
              spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
              offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(
              imageSrc,
              imageSize,
              imgOptions,
            ),
            marker = new kakao.maps.Marker({
              position: position, // 마커의 위치
              image: markerImage,
              clickable: true,
            })

          marker.setMap(map) // 지도 위에 마커를 표출합니다
          markers.push(marker) // 배열에 생성된 마커를 추가합니다

          return marker
        }

        // 지도 위에 표시되고 있는 마커를 모두 제거합니다
        function removeMarker() {
          for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null)
          }
          markers = []
        }

        // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
        function displayPagination(pagination) {
          var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i

          // 기존에 추가된 페이지번호를 삭제합니다
          while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild)
          }

          for (i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a')
            el.href = '#'
            el.innerHTML = i

            if (i === pagination.current) {
              el.className = 'on'
            } else {
              el.onclick = (function (i) {
                return function () {
                  pagination.gotoPage(i)
                }
              })(i)
            }

            fragment.appendChild(el)
          }
          paginationEl.appendChild(fragment)
        }

        // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
        // 인포윈도우에 장소명을 표시합니다
        function displayInfowindow(marker, title) {
          var content =
            '<div style="padding:5px;z-index:1;">' + title + '</div>'

          infowindow.setContent(content)
          infowindow.open(map, marker)
        }

        // 검색결과 목록의 자식 Element를 제거하는 함수입니다
        function removeAllChildNods(el) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild)
          }
        }
      }
    },
  )
}

///////////////////////test
function setOriginPoint(originAddress) {
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
    JSON.stringify(originAddress),
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
        const originPoint = {
          lat: result[0].y,
          lng: result[0].x,
        }
        // setOriginButton.addEventListener('click', function () {
        //   console.log('출발지로 설정버튼 눌림')
        //   sendPost(originPoint)
        // })
      } else {
        var markers = []

        var ps = new kakao.maps.services.Places()

        // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
        var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })

        // 키워드로 장소를 검색합니다
        searchPlaces2()

        // 키워드 검색을 요청하는 함수입니다
        function searchPlaces2() {
          var keyword = document.getElementById('originAddress').value

          if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!')
            return false
          }

          // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
          ps.keywordSearch(keyword, placesSearchCB2)
        }

        // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
        function placesSearchCB2(data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {
            // 정상적으로 검색이 완료됐으면
            // 검색 목록과 마커를 표출합니다

            displayPlaces2(data)

            // 페이지 번호를 표출합니다
            displayPagination2(pagination)
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.')
            return
          } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.')
            return
          }
        }

        // 검색 결과 목록과 마커를 표출하는 함수입니다
        function displayPlaces2(places) {
          var listEl = document.getElementById('placesList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment(),
            bounds = new kakao.maps.LatLngBounds(),
            listStr = ''

          // 검색 결과 목록에 추가된 항목들을 제거합니다
          removeAllChildNods(listEl)

          // 지도에 표시되고 있는 마커를 제거합니다
          removeMarker()

          for (var i = 0; i < places.length; i++) {
            // 마커를 생성하고 지도에 표시합니다
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
              marker = addMarker(placePosition, i),
              itemEl = getListItem2(i, places[i]) // 검색 결과 항목 Element를 생성합니다

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition)

            // 마커와 검색결과 항목에 mouseover 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
            ;(function (marker, title) {
              kakao.maps.event.addListener(marker, 'mouseover', function () {
                displayInfowindow(marker, title)
              })

              kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close()
              })

              itemEl.onmouseover = function () {
                displayInfowindow(marker, title)
              }

              itemEl.onmouseout = function () {
                infowindow.close()
              }
            })(marker, places[i].place_name)

            fragment.appendChild(itemEl)
          }

          // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
          listEl.appendChild(fragment)
          menuEl.scrollTop = 0

          // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
          map.setBounds(bounds)
        }

        // 검색결과 항목을 Element로 반환하는 함수입니다
        function getListItem2(index, places) {
          var el = document.createElement('li'),
            itemStr =
              '<span class="markerbg marker_' +
              (index + 1) +
              '"></span>' +
              '<div class="info">' +
              '   <h5>' +
              places.place_name +
              '</h5>'

          if (places.road_address_name) {
            itemStr +=
              '    <span class="road">' +
              places.road_address_name +
              '</span>' +
              '   <button id = "startButton">출발</button>' +
              '   <span class="jibun gray">' +
              places.address_name +
              '</span>'
          } else {
            itemStr += '    <span>' + places.address_name + '</span>'
          }

          itemStr +=
            '  <span class="tel">' + places.phone + '</span>' + '</div>'

          el.innerHTML = itemStr
          el.className = 'item'

          var startButton = el.querySelector('#startButton')
          if (startButton) {
            startButton.addEventListener('click', handleButtonClick2)
          }
          return el
        }

        // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
        function addMarker(position, idx, title) {
          var imageSrc =
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
            imgOptions = {
              spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
              spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
              offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(
              imageSrc,
              imageSize,
              imgOptions,
            ),
            marker = new kakao.maps.Marker({
              position: position, // 마커의 위치
              image: markerImage,
              clickable: true,
            })

          marker.setMap(map) // 지도 위에 마커를 표출합니다
          markers.push(marker) // 배열에 생성된 마커를 추가합니다

          return marker
        }

        // 지도 위에 표시되고 있는 마커를 모두 제거합니다
        function removeMarker() {
          for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null)
          }
          markers = []
        }

        // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
        function displayPagination2(pagination) {
          var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i

          // 기존에 추가된 페이지번호를 삭제합니다
          while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild)
          }

          for (i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a')
            el.href = '#'
            el.innerHTML = i

            if (i === pagination.current) {
              el.className = 'on'
            } else {
              el.onclick = (function (i) {
                return function () {
                  pagination.gotoPage(i)
                }
              })(i)
            }

            fragment.appendChild(el)
          }
          paginationEl.appendChild(fragment)
        }

        // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
        // 인포윈도우에 장소명을 표시합니다
        function displayInfowindow(marker, title) {
          var content =
            '<div style="padding:5px;z-index:1;">' + title + '</div>'

          infowindow.setContent(content)
          infowindow.open(map, marker)
        }

        // 검색결과 목록의 자식 Element를 제거하는 함수입니다
        function removeAllChildNods(el) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild)
          }
        }
      }
    },
  )
}
/////////test

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
      document.getElementById('hi').innerHTML = `안녕하세요! ${data.username}님`
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
      console.log(error)
    })
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
  originAddressInput.value = '     <현재위치로 출발지 설정됨>'
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

searchOriginButton.addEventListener('click', function () {
  // 인풋박스에서 입력된 도착지 주소 가져오기
  var originAddress = originAddressInput.value

  // 주소를 이용하여 지도를 갱신하는 함수 호출
  setOriginPoint(originAddress)
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

matchingButton.addEventListener('click', function () {
  matchingButton.disabled = true
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
      matchingButton.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'
      socket.emit('doMatch', data, (user) => {
        console.log('수신완료:', user)
      })
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
      console.log(error)
      matchingButton.disabled = false
    })
})

function drawAccept(matchingPath) {
  boxAndButton.innerHTML = `
  <style>
  td {
    padding: 15px;
    border: 1px solid #ddd;
    text-align: center;
  }
  tr:first-child td {
    background-color: skyblue;
    color: white;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.15);
    margin-top: 40px;
  }
  .button-container {
    position: relative;
    width: 355px;
    color: white; /* 글자색을 흰색으로 설정 */
    border: none; /* 기본 버튼 테두리를 제거 */
    padding: 10px 20px; /* 버튼 내부의 여백 설정 */
    text-align: center; /* 텍스트를 중앙으로 정렬 */
    text-decoration: none; /* 텍스트 밑줄 제거 */
    display: inline-block;
    font-size: 16px;
    margin: 20px 60px;
    cursor: pointer; /* 마우스를 올렸을 때 커서 모양 변경 */
  }
  button {
    padding: 10px 20px;
    font-size: 32px;
    font-family: Arial, sans-serif; /* Add this line */
    cursor: pointer;
  }
  #accept-button {
    border-radius: 12px;
    background-color: hsl(197, 71%, 50%);
   
  }
  #reject-button {
    border-radius: 12px;
    background-color: skyblue;
  }
  </style>
  <table>
    <tr>
      <td>매칭전</td>
      <td>매칭후</td>
    </tr>
    <tr>
      <td>${matchingPath.currentUserUP.fare} (원)</td>
      <td>${Math.floor(matchingPath.currentFare)} (원)</td>
    </tr>
    <tr>
      <td>${matchingPath.currentUserUP.time} (분)</td>
      <td>${Math.floor(matchingPath.matchedPath.summary.duration / 60)}(분)</td>
    </tr>
    <tr>
      <td>${matchingPath.currentUserUP.distance} (km)</td>
      <td>${Math.floor(matchingPath.currentDistance / 1000)} (km)</td>
    </tr>
  </table>
  <div class="button-container">
    <button id="accept-button">수락</button>
    <button id="reject-button">거절</button>
  </div>
`

  // 수락 버튼 이벤트 리스너 추가
  boxAndButton.querySelector('#accept-button').addEventListener('click', () => {
    let buttonContainer = document.querySelector('.button-container')
    if (buttonContainer) {
      buttonContainer.remove()
    }
    handleAccept() // 수락 버튼 클릭 시 처리할 함수 호출
  })

  // 거절 버튼 이벤트 리스너 추가
  boxAndButton.querySelector('#reject-button').addEventListener('click', () => {
    let buttonContainer = document.querySelector('.button-container')
    if (buttonContainer) {
      buttonContainer.remove()
    }
    handleReject()
  })
}

// 수락 버튼 클릭 시 처리할 함수
function handleAccept() {
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
      console.log(data)
      socket.emit('accept', data)
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
    })
}

function handleReject() {
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
      socket.emit('reject', data)
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
    })
}

//global socketOn
socket.on('oppAlreadyMatched', () => {
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
      socket.emit('doMatch', data, (user) => {
        console.log('수신완료:', user)
      })
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
      console.log(error)
    })
})

// socket.on('noPeople', () => {
//   alert('매칭상대가 존재하지 않습니다, 잠시후 다시 시도해주세요')
// })

// socket.on('someonePointedMe', () => {})

socket.on('matching', (matchingPath) => {
  var placeName = []
  switch (matchingPath.caseIndex) {
    case 0:
      placeName = [
        matchingPath.username + '님 승차',
        matchingPath.oppname + '님 승차',
        matchingPath.username + '님 하차',
        matchingPath.oppname + '님 하차',
      ]
      break
    case 1:
      placeName = [
        matchingPath.oppname + '님 승차',
        matchingPath.username + '님 승차',
        matchingPath.username + '님 하차',
        matchingPath.oppname + '님 하차',
      ]
      break
    case 2:
      placeName = [
        matchingPath.username + '님 승차',
        matchingPath.oppname + '님 승차',
        matchingPath.oppname + '님 하차',
        matchingPath.username + '님 하차',
      ]
      break
    case 3:
      placeName = [
        matchingPath.oppname + '님 승차',
        matchingPath.username + '님 승차',
        matchingPath.oppname + '님 하차',
        matchingPath.username + '님 하차',
      ]
      break
  }

  var markers = []

  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
      level: 8, // 지도의 확대 레벨
    }

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption)

  // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })
  var geocoder = new kakao.maps.services.Geocoder()

  var marker = new kakao.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
    infowindow = new kakao.maps.InfoWindow({ zindex: 1 }) // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

  var places = [
    matchingPath.matchedPath.summary.origin,
    matchingPath.matchedPath.summary.waypoints[0],
    matchingPath.matchedPath.summary.waypoints[1],
    matchingPath.matchedPath.summary.destination,
  ]
  for (let i = 0; i < 4; i++) {
    places[i].name = placeName[i]
  }
  let promises = []
  for (let i = 0; i < 4; i++) {
    let promise = searchDetailAddrFromCoords(places[i])
      .then((result) => {
        places[i].jibunAddr = result[0].address.address_name
      })
      .catch((error) => {
        console.error(error)
      })
    promises.push(promise)
  }

  Promise.all(promises).then(() => {
    console.log(matchingPath)
    displayPlaces(places)
  })

  sendButton.remove()
  drawAccept(matchingPath)
  // mapContainer.style.height = '300%'

  // 좌표로 주소가져오는 함수
  function searchDetailAddrFromCoords(coords) {
    // Promise를 반환합니다
    return new Promise((resolve, reject) => {
      // 좌표로 법정동 상세 주소 정보를 요청합니다
      geocoder.coord2Address(coords.x, coords.y, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(result)
        } else {
          reject(status)
        }
      })
    })
  }

  // 검색 결과 목록과 마커를 표출하는 함수입니다
  function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
      menuEl = document.getElementById('menu_wrap'),
      fragment = document.createDocumentFragment(),
      bounds = new kakao.maps.LatLngBounds(),
      listStr = ''

    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl)

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker()

    for (var i = 0; i < places.length; i++) {
      // 마커를 생성하고 지도에 표시합니다

      var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
        marker = addMarker(placePosition, i),
        itemEl = getListItem(i, places[i]) // 검색 결과 항목 Element를 생성합니다

      bounds.extend(placePosition)

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
      // LatLngBounds 객체에 좌표를 추가합니다

      // 마커와 검색결과 항목에 mouseover 했을때
      // 해당 장소에 인포윈도우에 장소명을 표시합니다
      // mouseout 했을 때는 인포윈도우를 닫습니다
      ;(function (marker, title) {
        kakao.maps.event.addListener(marker, 'mouseover', function () {
          displayInfowindow(marker, title)
        })

        kakao.maps.event.addListener(marker, 'mouseout', function () {
          infowindow.close()
        })

        itemEl.onmouseover = function () {
          displayInfowindow(marker, title)
        }

        itemEl.onmouseout = function () {
          infowindow.close()
        }
      })(marker, places[i].name)

      fragment.appendChild(itemEl)
    }
    var locationMove = new kakao.maps.LatLng(37.5247192, 124.1142915)

    bounds.extend(locationMove)

    map.setBounds(bounds)

    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment)
    menuEl.scrollTop = 0

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
  }

  // 검색결과 항목을 Element로 반환하는 함수입니다
  function getListItem(index, places) {
    var el = document.createElement('li'),
      itemStr =
        '<span class="markerbg marker_' +
        (index + 1) +
        '"></span>' +
        '<div class="info">' +
        '   <h5>' +
        places.name +
        '</h5>'
    itemStr += '<span>' + places.jibunAddr + '</span>'

    el.innerHTML = itemStr
    el.className = 'item'

    return el
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    var imageSrc =
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
      imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
      imgOptions = {
        spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
        spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
        offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
      },
      markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
      marker = new kakao.maps.Marker({
        position: position, // 마커의 위치
        image: markerImage,
      })

    marker.setMap(map) // 지도 위에 마커를 표출합니다
    markers.push(marker) // 배열에 생성된 마커를 추가합니다

    return marker
  }

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다
  function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null)
    }
    markers = []
  }

  // 인포윈도우에 장소명을 표시합니다
  function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>'

    infowindow.setContent(content)
    infowindow.open(map, marker)
  }

  // 검색결과 목록의 자식 Element를 제거하는 함수입니다
  function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.lastChild)
    }
  }
})

socket.on('rejectMatching', () => {
  alert('매칭이 취소되었습니다.')
  location.reload()
})

socket.on('noDriver', () => {
  alert('대기중인 택시가 없습니다.')
  location.reload()
})

socket.on('kakaoPay', (link) => {
  window.location.href = isMobile()
    ? link.next_redirect_mobile_url
    : link.next_redirect_pc_url
})

function isMobile() {
  // 터치 기능 확인
  const hasTouchScreen = window.matchMedia(
    '(hover: none) and (pointer: coarse)',
  ).matches
  // 화면 크기 확인
  const isMobileSize = window.matchMedia('(max-width: 768px)').matches

  return hasTouchScreen && isMobileSize
}

socket.on('noUnmatchedPath', () => {
  alert('출발지와 목적지를 설정하고 매칭을 시도해주세요')
})

// 돋보기 누르지 않고 출발지 설정버튼 누를때 주소를 좌표로 바꿔서 서버에 전송하는 함수
function setOriginPoint2(originAddress) {
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
    JSON.stringify(originAddress),
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
        const originPoint = {
          lat: result[0].y,
          lng: result[0].x,
        }
        sendPost(originPoint)
      } else {
        alert('장소 키워드를 검색하여 찾거나 주소를 입력해주세요')
      }
    },
  )
}

// 돋보기 누르지 않고 출발지 설정버튼 누를때 이벤트
setOriginButton.addEventListener('click', function () {
  setOriginPoint2(originAddressInput.value)
})

//도착지 설정버튼을 돋보기 없이 눌렀을때 좌표 전송 함수
function updateMapWithDestination2(destinaitionAddress) {
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
        setDestination(destinationPoint)
      } else {
        alert('장소 키워드를 검색하여 찾거나 주소를 입력해주세요')
      }
    },
  )
}

// 돋보기 누르지 않고 바로 도착지 설정버튼 눌렀을 때
setDestinationButton.addEventListener('click', function () {
  updateMapWithDestination2(destinationAddressInput.value)
})
