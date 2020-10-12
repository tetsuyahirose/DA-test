const fs = require("fs").promises;
let path = "./numbers.text";
async function makeDict() {
  let data = await fs.readFile(path, "utf-8");
  if (!data) {
    return false;
  }
  let dict = [];
  let arr = data.split("\n");
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].split(":");
    let value = str[1];
    let obj = {};
    obj.num = str[0];
    obj.value = value;
    dict.push(obj);
  }
  return dict;
}

//ketaをみつけて関数に投げるためのfor文
function stringTonNum(str, nums, taisu, keta) {
  let result = 0;
  let flg = 0;
  for (let i = 0; i < keta.length; i++) {
    let search = keta[i].value;
    let index = str.indexOf(search);
    if (index != -1) {
      let string = str.slice(flg, index);
      result += fromNums(string, nums, taisu) * keta[i].num;
      flg = index + 1;
    }
  }
  if (str[flg] != undefined) {
    let string = str.slice(flg, str.length);
    let y = fromNums(string, nums, taisu);
    result = String(result);
    result = result.slice(0, result.length - String(y).length);
    result += y;
  }
  return result;
}

function fromNums(str, nums, taisu, keta) {
  let result = 0;
  for (let i = 0; i < taisu.length; i++) {
    let search = taisu[i].value;
    let index = str.indexOf(search);
    if (index != -1) {
      let string = str[index - 1];
      let place = nums.findIndex((r) => r.value == string);
      let num = nums[place].num;
      result += num * taisu[i].num;
    }
  }
  //最後の一桁
  let length = str.length;
  let string = str[length - 1];
  let place = nums.findIndex((r) => r.value == string);
  if (place != -1) {
    let num = nums[place].num;
    result += Number(num);
  }
  return result;
}

//下記はパスパラメータのチェックする関数
function checkOrder(str, array) {
  for (let i = 0; i < array.length; i++) {
    let index = str.indexOf(array[i].value);
    if (index != -1) {
      for (let j = 0; j <= i; j++) {
        let place = str.indexOf(array[j].value, index + 1);
        if (place != -1) return 0;
      }
    }
  }
  return 1;
}

function cexkTaisu(str, keta, taisu) {
  let flg = 0;
  for (let i = 0; i < keta.length; i++) {
    let search = keta[i].value;
    let index = str.indexOf(search);
    if (index != -1) {
      let string = str.slice(flg, index);
      if (!checkOrder(string, taisu)) return 0;
      flg = index + 1;
    }
  }
  return 1;
}

function checkStr(str, nums, taisu, keta) {
  for (let i = 0; i < str.length; i += 2) {
    let key = str[i];
    let place = nums.findIndex((r) => r.value == key);
    if (place == -1 || str[i] == "零") return 0;
  }
  for (let i = 1; i < str.length; i += 2) {
    let key = str[i];
    let place1 = taisu.findIndex((r) => r.value == key);
    let place2 = keta.findIndex((r) => r.value == key);
    if (place1 == -1 && place2 == -1) return 0;
  }
  return 1;
}

function checkParams(str, nums, keta, taisu) {
  let result = 0;
  result += checkOrder(str, keta);
  result += cexkTaisu(str, keta, taisu);
  result += checkStr(str, nums, keta, taisu);

  if (result != 3) return false;
  return true;
}

exports.handler = async (event) => {
  let pathParams = decodeURI(event.pathParameters.string);
  if (pathParams == "零") {
    return {
      statusCode: 200,
      body: "0",
    };
  }
  console.log(pathParams);
  let dict = await makeDict();
  let nums = [];
  let taisu = [];
  let keta = [];

  for (let i = 0; i < dict.length; i++) {
    if (i >= 0 && i <= 9) nums.push(dict[i]);
    else if (i >= 10 && i <= 12) taisu.push(dict[i]);
    else keta.push(dict[i]);
  }
  taisu = taisu.reverse();
  keta = keta.reverse();

  if (!checkParams(pathParams, nums, keta, taisu)) {
    return {
      statusCode: 204,
      body: "statusCode: 204",
    };
  }
  let result = stringTonNum(pathParams, nums, taisu, keta);

  const response = {
    statusCode: 200,
    body: result,
  };

  return response;
};
