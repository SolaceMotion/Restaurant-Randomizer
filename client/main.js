
//Variabel att ta spara alla resturanger i.
//document är ett objekt som innehåller document object model.
//Document object model används när man ändrar webbsidans utseende i.e lägga till noder eller text.
let resturants;
let sortedRestaurants
let categories = []
let last = undefined;

let randomFunc;

let Result = {};

//Main-funktion
async function main() {
  //Hämta alla resturanger från json-dokument i form av en array
  resturants = await fetchRestaurants()
  //Loopa över alla resturang-objekt.

  for (let i = 0; i < resturants.length; i++) {
    //Kolla range (avstånd) för varje restaurant och gör allt kommande
    checkRange(resturants[i]).then(data => {
      //Funktion som lägger till alla restauranter på sidan.
      addToDom(data)

      //Klick-event som randomiserar alla resturanger (Triggas när man trycker på en knappen "slumpa").
      //Denna metod måste ligga i for-loopen!!
      randomFunc = function () {

        if(last !== undefined) {
          last.className = 'foodContainer animate__animated animate__fadeIn'
          document.getElementsByTagName("footer")[0].append(last);
          document.getElementsByTagName("footer")[0].scrollBy(0, 10000)
          document.getElementsByTagName("footer")[0].scrollBy(0, -7.5)
        }

        //Ta fram en godtycklig restaurant.

        let sortedRestaurants = [];
        let filterCat = document.getElementById("fillher").value;
        // console.log(filterCat==='undefined');
        if(filterCat === '') {
          sortedRestaurants = resturants;
        }
        else {
          resturants.forEach((el) => {
            if(el.category == filterCat) {
              // console.log(el.category===filterCat);
              sortedRestaurants.push(el);
            }
          })
        }

        // console.log("test");

        const rand = sortedRestaurants[Math.floor(Math.random() * sortedRestaurants.length)-1]
        // console.log(sortedRestaurants);
        //Slumpa endast 
        if (rand.distance < PREFERRED_DISTANCE) {
          const ele = document.createElement("article")
          ele.className = 'foodContainer animate__animated animate__jackInTheBox'
          //Ta fram slumpa restaurant på skärmen
          ele.innerHTML = `
            <div class="cardimage" style='background-image: url(images/${rand.category}.jpg)'></div>
            <div class="cardbody">
            
              <div class="title">
                <h1 class="food-name">${rand.name}</h1>
              </div>
              <div class="food-content">
              <div>
              <span class="food-category">${rand.category}</span>
              <span class="food-location">${rand.location}</span>
              </div>
              <p class="food-distance">${rand.distance >= 1000 ? (rand.distance / 1000).toFixed(2) + " km" : rand.distance.toFixed(2) + " m" }</p>
              </div>
            </div>
          `
          //Läg till element med namn och kategorier under #content i HTML
          document.querySelector("#content").innerHTML = ''
          document.querySelector("#content").append(ele)
          last = ele;
        }
      }
      document.getElementById("randomize").onclick = randomFunc
    }).catch(err => console.error(err))
  }
}

main()

//Åtkomst till olika matematiska funktioner
const {PI, pow, sqrt, sin, cos, atan2, abs} = Math

function addToDom(data) {
  const li = document.createElement("li")
  //Skriv ut namn på restaurant och avståndet dit.
  const conditionalDistance = data.distance >= 1000 ? (data.distance / 1000).toFixed(2) + " km" : data.distance.toFixed(2) + " m"
  li.textContent = data.name + " (" + conditionalDistance + ") " + data.category
  //li.textContent = data.category
  document.querySelector("#restaurants").appendChild(li)
}

//Hämta personens aktuella position.
function getPosition() {
  //Om personen accepterar att programmet ska komma åt position
  if (navigator.geolocation) {
    //Returnera ett "promise-objakt". Detta är nödvändigt då användaren måste välja om programmet ska ha åtkomst till position.
    return new Promise((resolve, reject) => {
      //Läs av position
      return navigator.geolocation.getCurrentPosition((position => {
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

let PREFERRED_DISTANCE = 2000 //meter

document.getElementById("rang").addEventListener("input", () => {
  PREFERRED_DISTANCE = parseInt(document.getElementById("rang").value)
  console.log(PREFERRED_DISTANCE );
  main();
})

function checkRange(restaurant) {
  //Maybe refactor this
  return new Promise((resolve, reject) => {
    getPosition().then((pos) => {
        //Beräkna avstånd mellan två koordinatpar
      const distance = haversine(pos, restaurant.coords)

      //Sortera ut kategorier av samma sort
      //Om lista med kategorier inte inkluderar kategori 
      if (!categories.includes(restaurant.category)) {
        categories.push(restaurant.category)
      }

      if (distance < PREFERRED_DISTANCE) {
        //Lägg till avstånd på objekt och returnera nytt objekt. 
        //Detta behövs eftersom programmet baserar resturangerna som visas upp endast på avståndet.
        restaurant.distance = distance
        
        resolve(restaurant)
      }
    }).catch(err => reject(err))
  })
}

// Utvecklingsområde: Lägg till funktion som grupperar samtliga kategorier. T.ex om man trycker på kategorin "Pizzeria" Ska alla resturanger med kategorin Pizzera dyka upp.
// Slumpa en resturang utifrån vald kategori. T.ex när man väljer kategorin Pizzeria slumpas det fram en resturang med kategorin Pizzeria
