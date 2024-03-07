import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { RepositoryNotTreeError } from 'typeorm'

@Injectable()
export class KakaoMobilityService {
  async getInfo(
    originLat,
    originLng,
    destinationLat,
    destinationLng,
  ): Promise<any> {
    const REST_API_KEY = process.env.REST_API_KEY
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${originLng},${originLat}&destination=${destinationLng},${destinationLat}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`
    console.log(url)
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      })
      console.log(response.data.routes[0])

      return response.data.routes[0]
    } catch (error) {
      throw new Error(`Failed to fetch directions: ${error.message}`)
    }
  }

  async getWaypointInfo(
    originLat,
    originLng,
    firstWaypointLat,
    firstWaypointLng,
    SecondWaypointLat,
    SecondWaypointLng,
    destinationLat,
    destinationLng,
  ): Promise<any> {
    const REST_API_KEY = process.env.REST_API_KEY
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${originLng},${originLat}&destination=${destinationLng},${destinationLat}&waypoints=${firstWaypointLng},${firstWaypointLat}|${SecondWaypointLng},${SecondWaypointLat}&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`
    console.log(url)
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      })
      console.log(response.data.routes[0])

      return response.data.routes[0]
    } catch (error) {
      throw new Error(`Failed to fetch directions: ${error.message}`)
    }
  }
}
