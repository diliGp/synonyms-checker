const path = require("path");
const { _readFile, _writeFile } = require("./file");

const _inFile = path.resolve("./in.txt");
const _outFile = path.resolve("./out.txt");

const matchQuery = (left, right, dictionary, iteratedSoFar) => {
  const _lowerLeft = left.toLowerCase();
  const _lowerRight = right.toLowerCase();

  let result = "synonyms";

  /**
   * If entire dictionary is iterated,
   * end the search.
   */
  if (iteratedSoFar[_lowerLeft] && iteratedSoFar[_lowerRight]) {
    return "different";
  }

  /**
   * If left and right are same.
   */
  if (_lowerLeft === _lowerRight) {
    return result;
  }

  /**
   * If found in dictionary and same.
   */
  if (
    (dictionary[_lowerLeft] || []).includes(_lowerRight) ||
    (dictionary[_lowerRight] || []).includes(_lowerLeft)
  ) {
    return result;
  }

  iteratedSoFar[_lowerLeft] = true;
  iteratedSoFar[_lowerRight] = true;

  /**
   * We can derive the synonymous relationship indirectly:
   * if big is a synonym for large and large is a synonym for huge then big is a synonym for huge.
   */
  const matched = (dictionary[_lowerLeft] || [])
    .map((_newLeft) => {
      if ((iteratedSoFar[_newLeft] || []).length) {
        return "different";
      }

      return matchQuery(_newLeft, right, dictionary, iteratedSoFar);
    })
    .find((val) => val === "synonyms");

  return matched ? "synonyms" : "different";
};

const getParsedDictionary = (word, _dictionary) => {
  const [left, right] = word.split(" ");

  if (!_dictionary) {
    _dictionary = {};
  }

  const lowerLeft = left.toLowerCase();
  const lowerRight = right.toLowerCase();

  /**
   * left has already been pushed to dictionary,
   * add current as uniform array.
   */
  if (!_dictionary[lowerLeft]) {
    _dictionary[lowerLeft] = [lowerRight];
  } else if (!_dictionary[lowerLeft].includes(lowerRight)) {
    _dictionary[lowerLeft].push(lowerRight);
  }

  /**
   * right has already been pushed to dictionary,
   * add current as uniform array.
   */
  if (!_dictionary[lowerRight]) {
    _dictionary[lowerRight] = [lowerLeft];
  } else if (!_dictionary[lowerRight].includes(lowerLeft)) {
    _dictionary[lowerRight].push(lowerLeft);
  }

  return _dictionary;
};

const getCurrentWordTurn = (turn = "") =>
  !turn || turn === "query" ? "dictionary" : "query";

const parseInput = () => {
  const _content = _readFile(_inFile);
  const [_totalTests, ...rest] = _content.split("\n");

  let _wordsCount = 0;
  let _wordTurn = "";
  let _wordTurnCount = 0;
  let _dictionary = {};
  let output = "";

  rest.forEach((word) => {
    const iteratedSoFar = {};

    /**
     * When a number(dictionary/query words count) is met in the current line.
     */
    if (!isNaN(+word)) {
      _wordTurnCount = +word;
      _wordTurn = getCurrentWordTurn(_wordTurn);

      if (_wordTurn === "dictionary") {
        _dictionary = {};
      }

      return;
    }

    /**
     * Currently iterating dictionary words.
     */
    if (_wordTurn === "dictionary") {
      _wordsCount += 1;
      getParsedDictionary(word, _dictionary);
    }

    /**
     * If dictionary/query words are completely iterated for a test.
     */
    if (_wordsCount === _wordTurnCount) {
      _wordTurnCount = 0;
      _wordsCount = 0;

      return;
    }

    /**
     * Currently iterating query words.
     */
    if (_wordTurn === "query") {
      const [left, right] = word.split(" ");
      const op = matchQuery(left, right, _dictionary, iteratedSoFar);
      console.log(word, "==>", op);
      output += op;
      output += "\n";
    }
  });

  return output;
};

const main = () => {
  const _content = parseInput();
  _writeFile(_outFile, _content);
};

main();
