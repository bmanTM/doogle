// eslint-disable-next-line
const whitespaceRe = /\s/
function isWhiteSpace(c) {
  return whitespaceRe.test(c)
}

function makeURLFriendly(text) {
    // eslint-disable-next-line
    text = text.trim().replace(/[^\x00-\x7F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    let replaceUnderscore = [];
    let removeChar = [];
    let prevChar;
    for (let i = 0; i<text.length; i++) {
        const curChar = text.charAt(i);

        if (isWhiteSpace(curChar)) {
            if (prevChar === curChar) {
                removeChar.push(i);
            } else {
                replaceUnderscore.push(i);
            }
        }
        prevChar = curChar;
    }

    for (const i of replaceUnderscore) {
        text = text.substring(0, i) + '_' + text.substring(i + 1);
    }
    let shift = 0;
    for (const i of removeChar) {
        text = text.substring(0, i-shift) + text.substring(i-shift + 1);
        shift += 1;
    }

    return text;
}

export { makeURLFriendly };