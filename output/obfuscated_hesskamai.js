var MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ = ["avna", "lo}Wajdc\\`ht", "hcja", "ggukdh\\`ht", "|gfa* !achke`huq>2127", "(q`h`mle", "q8\nZ[\r\b\x0E\x0E\\V\x06VPW\x01\0Q\x1DJ\x1CO\x1C\x1DM\x10DC\x10A\x17@ED)+xy#\x7F\x7F~s/!-q*%!nj4m32;=>1f=4dce", "e;4rZEhgtr", "", ".", ".", ".", ".", ".", "ggukdh\\`ht", ".", "plidn", "Heg|bhq)W{qe", "n~}`bih|nik+iqnn", "\\{bt(Edgot", "org"];
var MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA = encVal => {
  let value_string = encVal.split("");
  let ord_string_value = value_string.map((x, i) => encVal.charCodeAt(i));
  let length_string = ord_string_value.length - 1;
  let dec_string = "";
  for (let val_enc of ord_string_value) {
    dec_string += String.fromCharCode(val_enc ^ length_string);
    length_string--;
  }
  return dec_string;
};
const alpha = Array.from(Array(26)).map((e, i) => i + 65);
const ALPHABET = alpha.map(x => String.fromCharCode(x));
const TYPES = {
  "get_flag_bit": MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[151 ^ 149]),
  "normal_bit": 0
};
const url = MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[95 ^ 91]);
const endpoint = MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[645 ^ 640]);
let init_hk = () => {
  let userA = MTkyYjA0OTIwOWU3NTk5NmRiM2E();
  let time = OGEwZDI4MGZhNWY3ZjUwMzRhZmY1ZjI4M2M();
  let key = MDlkNzk1ZGI3NzkzYjM();
  let axiome = NGVlN2U4OWYxOWVkMDExMDQyN2E();
  let validTok = YmE0ZmExYmUyMGExYjdhNjEwMjM4MjhkM2Q0N2Ri(userA, time, axiome, key);
  MDdjMjRiYzUyMTIyNDQ1NjU2MzM2NDRmYmE(validTok, userA).then(data => {
    document.getElementById(MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[310 ^ 290])).innerHTML = data.message;
  });
};
let MTkyYjA0OTIwOWU3NTk5NmRiM2E = () => {
  return MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[603 ^ 604]);
};
let MDlkNzk1ZGI3NzkzYjM = () => {
  return MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[240 ^ 246]);
};
let OGEwZDI4MGZhNWY3ZjUwMzRhZmY1ZjI4M2M = () => {
  return Math.floor(Date.now() / 1000);
};
let ZDA3NGM0OWIwMDc5OGZlN2U0N2I = () => {
  return Math.floor(Math.random() * 100);
};
let MDdjMjRiYzUyMTIyNDQ1NjU2MzM2NDRmYmE = async (token, uagent) => {
  const {
    data
  } = await axios.post(url + endpoint, {
    token: token
  }, {
    headers: {
      'Content-Type': MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[91 ^ 73]),
      'User-Agent': uagent
    }
  });
  return data;
};
let Yzk1NGU5YWVjODlmNWRhNzA2NzJhYzJl = (object, functionName, callback) => {
  (function(originalFunction) {
    object[functionName] = function() {
      var returnValue = originalFunction.apply(this, arguments);
      callback.apply(this, [returnValue, originalFunction, arguments]);
      return returnValue;
    };
  })(object[functionName]);
};
let YmE0ZmExYmUyMGExYjdhNjEwMjM4MjhkM2Q0N2Ri = (uAgent, timestamp, key, axiome) => {
  if (timestamp === undefined) return;
  if (key === undefined) return;
  if (axiome === undefined) return;
  let shuffledArray = ALPHABET.sort((a, b) => 0.5 - Math.random());
  let token = MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[785 ^ 793]);
  for (letter in shuffledArray) {
    token += btoa(shuffledArray[letter]);
    if (letter < 25) {
      token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[175 ^ 166]);
    }
  }
  token = btoa(token);
  token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[758 ^ 767]);
  token += btoa(timestamp);
  token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[12 ^ 5]);
  token += btoa(key);
  token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[464 ^ 473]);
  token += btoa(axiome);
  token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[615 ^ 622]);
  token += btoa(M2E2YjJkMGI(MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[388 ^ 391])));
  token += MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[152 ^ 145]);
  token += btoa(MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[471 ^ 455]));
  return token;
};
let YmZmZWZjNmEyZTNmNGY0NDIwM2M5ODhh = () => {
  return 0x13371337;
};
let M2E2YjJkMGI = type_str => {
  return TYPES[type_str];
};
let hook_btoa = (() => {
  Yzk1NGU5YWVjODlmNWRhNzA2NzJhYzJl(window, MWZjMmY5NDZmM2EyYzg5YjZiMTNiYTgzM2RiZTM4MTYzZDJjOTNhZA(MTBjYTQ3YTAxMDhjNzVjOWE0NTBkNzAxZDBlNjJjMWQ3MzMzMTJlMQ[13 ^ 13]), hooked_btoa);
})();
let NGVlN2U4OWYxOWVkMDExMDQyN2E = () => {
  let magic = YmZmZWZjNmEyZTNmNGY0NDIwM2M5ODhh();
  let randNum = ZDA3NGM0OWIwMDc5OGZlN2U0N2I();
  let validAxiome = magic ^ randNum;
  validAxiome = validAxiome << 1;
  return validAxiome;
};