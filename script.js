let currentsong = new Audio()
let songs
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Adding leading zeros if necessary
    var minutesString = minutes < 10 ? '0' + minutes : minutes;
    var secondsString = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return minutesString + ':' + secondsString;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement(`div`)
    div.innerHTML = response
    let as = div.getElementsByTagName(`a`)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(`.mp3`)) {
            songs.push(element.href.split(`/${folder}/`)[1].replaceAll(`%20`, ` `))
            // .replace(`%20`, ` `)
        }
    }


    // show all song in the playlist
    let songUL = document.querySelector(`.songList`).getElementsByTagName(`ul`)[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
    <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replace(`%20`, ` `)}</div>
                            <div>Dj</div>
                        </div>
                        <div class="playnow">
                            <span>Play now</span>
                       <img class="invert" src="img/pause.svg" alt="">
                        </div>
                        </li>`
    }

    // add event listener to each song
    Array.from(document.querySelector(`.songList`).getElementsByTagName(`li`)).forEach(e => {
        e.addEventListener(`click`, element => {
            playMusic(e.querySelector(`.info`).firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        playbtn.src = `img/play.svg`
    }

    document.querySelector(`.song-info`).innerHTML = track
    document.querySelector(`.song-time`).innerHTML = `00:00/00:00`
}

// display all the albums on the page
async function displayAlbums() {
    let cardContainer = document.querySelector(`.card-container`)
    let a = await fetch(`http://127.0.0.1:5500/song/`)
    let response = await a.text()
    let div = document.createElement(`div`)
    div.innerHTML = response
    let anchors = div.getElementsByTagName(`a`)
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes(`/song/`)) {
            let folder = e.href.split(`/`).slice(-1)[0]
            // get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/song/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    // load the playlist when card is clicked
    Array.from(document.getElementsByClassName(`card`)).forEach(e => {
        e.addEventListener(`click`, async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

// window.onload=function(){
//     let p1=document.querySelector(`.spotify-playlist h1`)
//     let p=prompt("Enter your name")
//     if (p !== null && p !== "") {
//         p1.textContent = p +"'s"+ " Playlist";
//     }
// }
window.onload = function () {
    let p1 = document.querySelector(`.spotify-playlist h1`);
    let storedName = localStorage.getItem("username");
    if (storedName) {
        p1.textContent = storedName + "'s Playlist";
    } else {
        let name = prompt("Enter your name:");
        if (name !== null && name !== "") {
            localStorage.setItem("username", name);
            p1.textContent = name + "'s Playlist";
        }
    }
};



async function main() {

    // get list of songs
    songs = await getSongs("song/arijit")

    await displayAlbums()


    playMusic(songs[0], true)

    
    // event listener for play
    playbtn.addEventListener(`click`, () => {
        if (currentsong.paused) {
            currentsong.play()
            playbtn.src = `img/play.svg`
        }
        else {
            currentsong.pause()
            playbtn.src = `img/pause.svg`
        }
    })
    // listen for time update event
    currentsong.addEventListener(`timeupdate`, () => {
        document.querySelector(`.song-time`).innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}:${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(`.circle`).style.left = (currentsong.currentTime / currentsong.duration) * 100 + `%`
    })

    // add event listener to seekbar
    document.querySelector(`.seekbar`).addEventListener(`click`, e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(`.circle`).style.left = percent + `%`
        currentsong.currentTime = (percent * currentsong.duration) / 100
    })

    // add event listener to hamburger
    document.querySelector(`.hamburger`).addEventListener(`click`, () => {
        document.querySelector(`.left`).style.left = `0`
    })
    // add event listener to cross
    document.querySelector(`.cross`).addEventListener(`click`, () => {
        document.querySelector(`.left`).style.left = -500 + `%`
    })





    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0].replaceAll("%20", " "))
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else if (index == 0) {
            playMusic(songs[0]);
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentsong.pause()
        // let index = songs.indexOf(currentsong.src.split('/song/')[1].replaceAll("%20", " "))
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0].replaceAll("%20", " "))
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else if ((index + 1) == songs.length) {
            playMusic(songs[0]);
        }
    })

    // add event listener to sound and mute svg
    sound.addEventListener(`click`, () => {
        if (currentsong.volume != 0) {
            currentsong.volume = 0
            sound.src = `img/mute.svg`
            range.value = 0
        }
        else {
            sound.src = `img/sound.svg`
            range.value = 20
            currentsong.volume = 0.2
        }




    })
    range.addEventListener(`change`, (e) => {
        // currentsong.volume=(e.target.value/100)
        // console.log(e.target.value/100)
        // range.duration=e.target.value/100
        const volumeLevel = range.value;
        currentsong.volume = volumeLevel / 100;
        if (volumeLevel == 0) {
            sound.src = `img/mute.svg`
        }
        else {
            sound.src = `img/sound.svg`
        }
    })


    


    
}

main() 