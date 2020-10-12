const fs = require("fs").promises;
let path = "./numbers.text";

function isNum(str) {
  //数字以外や、2桁以上で先頭が0のときはfalse,それ以外はtrue
  if (str.length >= 2 && str[0] == "0") return false;
  if (str.indexOf("　") >= 0 || str.indexOf(".") >= 0) return false;
  let nun = Number(str);
  let check = isNaN(nun); //数値でない場合にtrueを返す
  return !check;
}

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

function fillZero(num) {
  let result = num;
  let remainder = result.length % 4;

  if (remainder) remainder = 4 - remainder;
  for (let i = 0; i < remainder; i++) result = "0" + result;
  return result;
}

function displayZero(num, dic) {
  let tag = num + 12;
  return dic[tag].value;
}

//桁数に合わせて、文字を作成する
function formNum(num, dict) {
  let i = 0;
  while (dict[i] != undefined && num != 0) {
    if (num == dict[i].num) return dict[i].value;
    i++;
  }
  return "";
}

//桁に合わせたオブジェクトの作成
function createObjeckt(num) {
  let i = 0;
  // let object = {one:"0", ten:"0", hundred:"0", thousand:"0"}
  let object = { 千: "0", 百: "0", 拾: "0", 壱: "0" };
  for (const property in object) {
    object[property] = num[i];
    i++;
    if (num.length == i) break;
  }
  return object;
}

//上位4桁がゼロ埋めされた可能性のある数字
function changeToText(num, dict) {
  let size = num.length / 4;
  let i = 0;
  let result = "";
  while (i < size) {
    let object = createObjeckt(num);
    for (const property in object) {
      let str = formNum(object[property], dict);
      result += str;
      if (str != "" && property != "壱") result += property;
    }
    if (i != size - 1) result += displayZero(size - i - 1, dict);
    i++;
    num = num.slice(4, num.length);
  }
  return result;
}

exports.handler = async (event) => {
  // TODO implement
  let str = event.pathParameters.string;
  if (str == 0) {
    return {
      statusCode: 200,
      body: "零",
    };
  }
  let result = isNum(str);
  let m = Number(str);
  console.log(m);
  if (!result || m < 0 || str.length > 16) {
    console.log(result);
    return {
      statusCode: 204,
      body: "statusCode:204",
    };
  }
  let dict = await makeDict();
  let num = fillZero(str);
  result = decodeURI(changeToText(num, dict));
  const response = {
    statusCode: 200,
    body: result,
  };
  return response;
};
