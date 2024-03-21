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

fetch('/unmatchedPath/getUser', {
  method: 'POST',
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
    // 받아온 데이터에 따라 버튼 이름 설정
    modeButton.innerText = data.isDriver ? 'Passenger Mode' : 'Driver Mode'
  })
  .catch((error) => {
    console.error('Error:', error)
  })

modeButton.addEventListener('click', function () {
  fetch('/unmatchedPath/changeMode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      // 받아온 데이터에 따라 버튼 이름 설정
      modeButton.innerText = data.isDriver ? 'Passenger Mode' : 'Driver Mode'

      // 버튼이 'Driver Mode'인 경우
      if (modeButton.innerText === 'Driver Mode') {
        // 홈 화면을 렌더링하는 요청을 보냄
        fetch('/unmatchedPath/driveMode', {
          method: 'GET',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to fetch home page')
            }
            // 홈 화면을 렌더링하는 HTML을 받아옴
            return response.text()
          })
          .then((html) => {
            // 받아온 HTML을 페이지에 삽입
            document.body.innerHTML = html
          })
          .catch((error) => {
            console.error('Error fetching home page:', error)
          })
      }
    })
    .catch((error) => {
      console.error('Error changing mode:', error)
    })
})

// modeButton.addEventListener('click', function () {
//   fetch('/unmatchedPath/changeMode', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error('error')
//       }
//       return response.json()
//     })
//     .then((data) => {
//       // 받아온 데이터에 따라 버튼 이름 설정
//       modeButton.innerText = data.isDriver ? 'Passenger Mode' : 'Driver Mode'
//     })
//     .catch((error) => {
//       console.error('Error:', error)
//     })
//   if (modeButton.innerText === 'Driver Mode') {
//     fetch('/unmatchedPath/driveMode', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('error')
//         }
//         return response.json()
//       })
//       .then((data) => {
//         console.log('드라이버 모드')
//       })
//       .catch((error) => {
//         console.error('Error:', error)
//       })
//   }
// })

// modeButton.addEventListener('click', function () {
//   fetch('/unmatchedPath/changeMode', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error('error')
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log('create Successful:', data)
//     })
//     .catch((error) => {
//       console.error('Error:', error)
//     })
// })

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

function handleButtonClick(event) {
  // 클릭된 버튼의 부모 요소인 리스트 아이템을 찾습니다
  var listItem = event.target.closest('.item')
  // 리스트 아이템에서 주소 정보를 찾습니다
  var addressSpan = listItem.querySelector('.jibun.gray')
  var destinationAddressInput = document.getElementById('destinationAddress')

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
  var addressSpan = listItem.querySelector('.jibun.gray')
  var originAddressInput = document.getElementById('originAddress')

  // 주소 정보가 있는 경우에만 처리합니다
  if (addressSpan) {
    // 주소 정보를 가져와서 인풋박스에 설정합니다
    originAddressInput.value = addressSpan.textContent
    setOriginPoint(originAddressInput.value)
  }
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
              '    <span>' +
              places.road_address_name +
              '</span>' +
              '   <button id = "arriveButton"onclick=" handleButtonClick()">도착</button>' +
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
          arriveButton.addEventListener('click', handleButtonClick)

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
        setOriginButton.addEventListener('click', function () {
          sendPost(originPoint)
        })
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
              '    <span>' +
              places.road_address_name +
              '</span>' +
              '   <button id = "startButton"onclick=" handleButtonClick2()">출발</button>' +
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
          startButton.addEventListener('click', handleButtonClick2)

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
      socket.emit('test', data, (user) => {
        console.log('수신완료:', user)
      })
    })
    .catch((error) => {
      console.error('UserId 가져오기 실패:', error)
      console.log(error)
    })
})

//global
socket.on('matching', (matchingPath) => {
  console.log('매칭성공!')
  console.log(matchingPath)
  drawAccept()
})
socket.on('rejectMatching', () => {
  alert('매칭이 취소되었습니다.')
  location.reload()
})

function drawAccept() {
  // 모달 창을 생성
  const modal = document.createElement('div')
  modal.classList.add('modal')

  // 모달 내용 생성
  modal.innerHTML = `
    <div class="modal-content">
      <p>수락하시겠습니까?</p>
      <button id="acceptButton">수락</button>
      <button id="rejectButton">거절</button>
    </div>
  `

  // 스타일 설정 (예시)
  modal.style.position = 'fixed'
  modal.style.top = '50%'
  modal.style.left = '50%'
  modal.style.transform = 'translate(-50%, -50%)'
  modal.style.backgroundColor = 'white'
  modal.style.padding = '20px'
  modal.style.border = '1px solid black'
  modal.style.zIndex = '9999'

  // 수락 버튼 이벤트 리스너 추가
  modal.querySelector('#acceptButton').addEventListener('click', () => {
    // closeModal(modal) // 모달 닫기

    handleAccept() // 수락 버튼 클릭 시 처리할 함수 호출
  })

  // 거절 버튼 이벤트 리스너 추가
  modal.querySelector('#rejectButton').addEventListener('click', () => {
    handleReject()
    closeModal(modal) // 모달 닫기
  })

  // 모달을 body에 추가
  document.body.appendChild(modal)
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
      socket.emit('accept', data, (message) => {
        alert(message)
      })
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

// 모달 닫기 함수
function closeModal(modal) {
  modal.remove()
}

window.onload = function () {
  const testButton = document.getElementById('test')

  if (testButton) {
    testButton.addEventListener('click', function () {
      Kakao.Navi.start({
        name: '현대백화점 판교점',
        x: 127.11205203011632,
        y: 37.39279717586919,
        coordType: 'wgs84',
      })
    })
  } else {
    console.error('testButton이 찾을 수 없습니다.')
  }

  socket.on('wantLocation', function (data) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const data = {
          lat: latitude,
          lng: longitude,
        }
        socket.emit('hereIsLocation', data)
      })
    } else {
      alert('이 브라우저에서는 Geolocation 을 지원하지 않습니다.')
    }
  })
}
