/*
    YEAH !! Javascript obfuscation Challenge BAHAHAHHAHAHAAHHAHAHAHAHAHAHAHAHAHAHAH. 
*/



const alpha = Array.from(Array(26)).map((e, i) => i + 65);
const ALPHABET = alpha.map((x) => String.fromCharCode(x));

const TYPES = {
    "get_flag_bit": 1,
    "normal_bit": 0 
}

const url = "http://localhost:1337";
const endpoint = "/welcome"

let get_key = (() => {
    return ("0x5df1347da0cdd31a2d1c77d8ce5e4bdd65ee8effd949b841ad9a882597c97fbe")
})

let magic_number = (() => {
    return (0x13371337);
})

let get_uagent = (() => {
    return "l33t_Akeur"
})

let get_timestamp = (() => {
    return Math.floor(Date.now() / 1000)
})

let get_random = (() => {
    return Math.floor(Math.random() * 100)
})

let gen_axiome = (() => {
    let magic = magic_number()
    let randNum = get_random()


    let validAxiome = magic ^ randNum

    validAxiome = validAxiome << 1


    return validAxiome
})

let type = ((type_str) => {
    return TYPES[type_str]
})

let gen_valid_token = ((uAgent, timestamp, key, axiome) => {
    //if (uAgent !== "l33t_Akeur") return;

    if (timestamp === undefined) return;

    if (key === undefined) return;

    if (axiome === undefined) return;

    let shuffledArray = ALPHABET.sort((a, b) => 0.5 - Math.random());

    let token = ""

    for (letter in shuffledArray) {
        token+= btoa(shuffledArray[letter])
        if (letter < 25) {
            token+= "."
        }
    }
    
    token = btoa(token)
    token += "."
    token += btoa(timestamp)
    token += "."
    token += btoa(key)
    token += "."
    token += btoa(axiome)
    token += "."
    token += btoa(type("normal_bit"))
    token += "."
    token += btoa("token")

    return token;
    
})

let fetch_request = ( async (token, uagent) => {
    const {data} = await axios.post(url+endpoint, {
        token: token,
        }, {
            headers: {
            'Content-Type': 'application/json',
            'User-Agent': uagent,
            }
        }
    )
    return data
})

let init_hk = (() => {
    let userA = get_uagent()

    let time = get_timestamp()

    let key = get_key();

    let axiome = gen_axiome()

    
    let validTok = gen_valid_token(userA, time, axiome, key)


    fetch_request(validTok, userA)
        .then((data) => {
            document.getElementById("msg").innerHTML = data.message
        })
    
})
