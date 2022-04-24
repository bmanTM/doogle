
function stripString(str) {
    // eslint-disable-next-line
    return (str.trim().replace(/[^\x00-\x7F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/,""));
}

/*
    Returns scale of 1-100 float, computes how relative a string is to another string
*/
function computeRelativityScore(inString, refString) {
    inString = stripString(inString);
    refString = stripString(refString);

    let matchedChars = 0;
    let closeMatchChars = 0;
    for (let i = 0; i < inString.length; i++) {
        const inStringChar = inString[i];
        const refStringChar = refString[i];

        if (inStringChar === refStringChar) {
            matchedChars += 1;
        } else {
            if (inStringChar === refString[i+1] || inStringChar === refString[i-1]) {
                closeMatchChars += 1;
            }
        }
    }

    const score = ((matchedChars+(closeMatchChars/2))/inString.length) * 100
    return (score);
}

/*
    Takes dog cache, and predicts from db
*/
function predictFromDB ( submission, db, numPredictions ) {
    const highestMatches = []; /* {predictedWord: val, accuracy: float} */

    if (submission.replace(/\s/,"") === "") {
        return ([]);
    }

    const updateHighestMatches = (subEntry) => {
        const score = computeRelativityScore(submission, subEntry);
        const entry = {
            predictedWord: subEntry,
            accuracy: score,
        }

        if (highestMatches.length == 0) {
            highestMatches.push(entry);
        } else {
            let entryAdded = false
            let i = 0;
            while (i<highestMatches.length && !entryAdded) {
                const curMatch = highestMatches[i];
                if ((entry.accuracy > curMatch.accuracy) ||
                    (entry.accuracy === curMatch.accuracy && entry.predictedWord.length < curMatch.predictedWord.length)) {
                    highestMatches.splice(i, 0, entry);
                    entryAdded = true;
                } 
                i++;
            }
        }
    }

    for (const entry in db) {
        if (Array.isArray(db[entry])) {
            for (const subEntry of db[entry]) {
                updateHighestMatches(entry+" "+subEntry);
                updateHighestMatches(subEntry+" "+entry);
            }
        }
        
        updateHighestMatches(entry)
    }

    return highestMatches.slice(0, numPredictions);
}

export default predictFromDB;