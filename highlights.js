const fs    = require('fs');
const usage = 'usage: ./rh filename highlights_number';
const nGrammLength = 2;

/**
 * Prints msg to output and exits with errno
 * @param {string} msg - message to display
 * @param {number} errno - error number(0 if no error)
 */
function die(msg, errno) {
    if (typeof errno === 'undefined')
        errno = 0;
    errno === 0 ? console.log(msg) : console.error(msg);
    process.exit(errno);
}

/**
 * Reads text file with utf8 encoding
 * @param {string} path - path to file
 * @returns {Promise}
 */
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function(err, data) {
            if (err) {
                reject(err);
                return ;
            }

            let reviews = [];
            for (let review of data.split('\n')) {
                reviews.push(review);
            }
            resolve(reviews);
        })
    })
}

/**
 * Splits text to ngram dictionary.
 * @param {string} text - string to get ngrams from
 * @param {number} n - ngram length
 * @returns {Object} ngram dictionary
 */
function getNgrams(text, n) {
    if (typeof text === 'undefined' || n === 0)
        return [];

    let ngrams = {};
    text = text.toLowerCase();
    // remove punctuation
    text = text.replace(/[^a-zA-Z ']/g, ' ');
    // remove double spaces
    text = text.replace(/  /g, ' ');
    // remove context dependent words
    text = text.replace(/ (just|too|is|i|it|on|a|an|the|and|or|but) /g, ' ');
    let array = text.split(' ');
    for (let i = 0; i < array.length - n; i++) {
        let keyword = array.slice(i, i + n).join(' ');
        ngrams[keyword] === 0 ? ngrams[keyword]++ : ngrams[keyword] = 1;
    }
    return (ngrams);
}

/**
 * Merges current ngram to common ngram dictionary.
 * @param {Object} all - common ngram dictionary
 * @param {Object} current - current ngram dictionary
 * @param {number} currIdx - current review id
 */
function merge(all, current, currIdx) {
    for (field in current) {
        if (all.hasOwnProperty(field)) {
            all[field].count += current[field];
            all[field].reviews.push(currIdx);
        } else {
            all[field] = {
                count: current[field],
                reviews: [ currIdx ]
            }
        }
    }
}

/**
 * Builds highlights dictionary from reviews
 * @param {Array} reviews - list of reviews
 * @param {Object} n - number of highlights
 * @returns {Array} - array of highlights
 */
function buildHighlightsList(reviews, n) {
    let nGrams = {};

    // get single review highlight and merge it to common result
    for (let [index, review] of reviews.entries()) {
        // save review index when merging
        merge(nGrams, getNgrams(review, nGrammLength), index);
    }
    // convert dictionary to array for sorting
    let array = [];
    for (let key in nGrams) {
        array.push({
            keyword: key,
            count: nGrams[key].count,
            reviews: nGrams[key].reviews
        });
    }
    // sort based on count(descending)
    array.sort((a, b) => b.count - a.count);
    // build result
    let result = [];
    let idx = 0;
    while (result.length < n) {
        // array[idx].reviews is an array of review indexes
        for (let i of array[idx].reviews) {
            // if review has not been added yet
            if (!reviews[i].highlighted) {
                // mark it as highlighted and add to result list
                result.push(reviews[i]);
                reviews[i].highlighted = true;
            }
            if (result.length === n) break ;
        }
        // if result's length is still insufficient add ngram to result list
        if (result.length < n)
            result.push(array[idx].keyword);
        idx++;
    }
    return (result);
}

function main(argv) {
    let n = Number(argv[1]);

    if (argv.length != 2)
        die(usage, 0);
    readFile(argv[0])
        .then(reviews => {
            if (n > reviews.length || n <= 0 || n !== n) {
                die('Highlights number is greater to reviews count or invalid');
            }
            let highlights = n < reviews.length
                ? buildHighlightsList(reviews, n)
                : reviews;
            console.log(highlights.join('\n'));
        })
        .catch(err => die(err.message, err.errno));
}

main(process.argv.slice(2, 4));
