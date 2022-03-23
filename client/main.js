
//Variabel att ta spara alla resturanger i.
let resturants;
let categories = []

//Main-funktion
async function main() {
  //Hämta alla resturanger från json-dokument i form av en array
  resturants = await fetchRestaurants()
  //Loopa över alla resturang-objekt.

  /* Promise.all(resturants.map(async item => {
    checkRange(item).then(data => {
      addToDom(data)
    }).catch(err => console.error(err))
  })) */

  for (let i = 0; i < resturants.length; i++) {
    checkRange(resturants[i]).then(data => {
      addToDom(data)
    }).catch(err => console.error(err))
    
  }
  console.log(categories)


}
main()

//Åtkomst till olika matematiska funktioner
const {PI, pow, sqrt, sin, cos, atan2, abs} = Math

function addToDom(data) {
  const li = document.createElement("li")
  //Skriv ut namn på resturang och avståndet dit.
  const conditionalDistance = data.distance >= 1000 ? (data.distance / 1000).toFixed(2) + " km" : data.distance.toFixed(2) + " m"
  li.textContent = data.name + " (" + conditionalDistance + ") " + data.category
  //li.textContent = data.category
  document.querySelector("#restaurants").appendChild(li)

}

const baseURL = location.href.substring(0, location.href.indexOf("?"))

document.getElementById("randomize").onclick = function () {
  const rand = resturants[Math.floor(Math.random() * resturants.length)].name
  const ele = document.createElement("div")
  ele.textContent = rand
  document.querySelector(".data_temp").append(ele)
  history.replaceState({}, "", baseURL + "?restaurant=" + rand)
  
  const param = location.search.substring(location.search.indexOf("=") + 1, location.search.length)
}

//Hämta personens aktuella position.
function getPosition() {
  //Om personen accepterar att programmet ska komma åt position
  if (navigator.geolocation) {
    //Returnera ett "promise-objekt". Detta är nödvändigt då användaren måste välja om programmet ska ha åtkomst till position.
    return new Promise((resolve, reject) => {
      //Läs av position
      return navigator.geolocation.watchPosition((position => {
        const lat = position.coords.latitude
        const long = position.coords.longitude
        //Returnera koordinater i en array till funktionen med resolve
        resolve([lat, long])
        /* return [lat, long] */
      }), error => reject(error), {enableHighAccuracy: true}) //Mer exakt position
    })
  } else {
    throw new Error("Koordinaterna hittades inte")
  }
}

async function fetchRestaurants() {
  //Öppna json-dokument
  const res = await fetch("resturants.json")
  //Kolla om filen finns
  if (res.ok) {
    //Omvandla innehållet till json-format och returnera resultatet i en array till funktionen
    return await res.json()
  }
}
  
// Haversine. Beräkna fågelvägen (meter) mellan två koordinatpar
// Referens: https://www.movable-type.co.uk/scripts/latlong.html
function haversine(coords1, coords2) {
  //Ta fram enskilda koordinater
  let [lat1, long1] = coords1
  let [lat2, long2] = coords2

  //Beräkna avstånd
  const EARTH_RADIUS = 6371 * 1000 //Jordradien i meter

  //Denna beräkning förstår jag mig inte på men den funkar
  //Konvertera koordinater från grader till radianer för att använda i trig-funktioner
  const dlong = abs(long2 - long1) * PI / 180
  const dlat = abs(lat2 - lat1) * PI / 180

  const a = pow(sin(dlat / 2.0), 2) + cos(lat1 * PI / 180) * cos(lat2 * PI / 180) * pow(sin(dlong / 2.0), 2)
  const c = 2*atan2(sqrt(a), sqrt(1-a))

  const distance = EARTH_RADIUS * c

  //Returnera avstånd
  return distance
}

const PREFERRED_DISTANCE = 1500 //meter

function checkRange(restaurant) {
    //Maybe refactor this
    return new Promise((resolve, reject) => {
      getPosition().then((pos) => {
        //Beräkna avstånd mellan två koordinatpar
        const distance = haversine(pos, restaurant.coords)

        if (!categories.includes(restaurant.category)) {
          categories.push(restaurant.category)
        }

        if (distance < PREFERRED_DISTANCE) {

          //Lägg till avstånd på objekt och returnera nytt objekt. Detta behövs eftersom programmet baserar resturangerna som visas upp endast på avståndet.
          restaurant.distance = distance
          
          resolve(restaurant)
        }
      }).catch(err => reject(err))
    })
  }

