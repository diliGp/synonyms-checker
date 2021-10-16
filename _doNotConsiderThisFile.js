const path = require("path");
const { _readFile, _writeFile } = require("./file");

const _inFile = path.resolve("./in.txt");
const _outFile = path.resolve("./out.txt");

const matchQuery = (left, right, dictionary) => {
  const _lowerCaseLeft = left.toLowerCase();
  const _lowerCaseRight = right.toLowerCase();

  const _upperCaseLeft = left.toUpperCase();

  let result = "synonyms";

  /**
   * If left ad right are same.
   */
  if (_lowerCaseLeft === _lowerCaseRight) {
    return result;
  }

  /**
   * If found in dictionary and same.
   */
  if (
    (dictionary[left] || "").toLowerCase() === _lowerCaseRight ||
    (dictionary[_lowerCaseLeft] || "").toLowerCase() === _lowerCaseRight ||
    (dictionary[_upperCaseLeft] || "").toLowerCase() === _lowerCaseRight
  ) {
    return result;
  }

  /**
   * Being synonyms doesn’t depend on order, e.g. if big is a synonym for large then large is a synonym for big.
   */
  if (dictionary.reverse) {
    const reverseQuery = dictionary.reverse;
    if (
      (reverseQuery[left] || "").toLowerCase() === _lowerCaseRight ||
      (reverseQuery[_lowerCaseLeft] || "").toLowerCase() === _lowerCaseRight ||
      (reverseQuery[_upperCaseLeft] || "").toLowerCase() === _lowerCaseRight
    ) {
      return result;
    }
  }

  /**
   * We can derive the synonymous relationship indirectly:
   * if big is a synonym for large and large is a synonym for huge then big is a synonym for huge.
   */
  if (dictionary[dictionary[left]]) {
    return matchQuery(dictionary[dictionary[left]], right, dictionary);
  }

  if (dictionary.reverse && dictionary.reverse[left]) {
    return matchQuery(dictionary.reverse[left], right, dictionary.reverse);
  }

  return "different";
};

const getParsedDictionary = (word, _dictionary) => {
  const [left, right] = word.split(" ");

  if (!_dictionary) {
    _dictionary = {
      reverse: {},
    };
  }

  _dictionary[left] = right;
  _dictionary.reverse[right] = left;

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
  let _dictionary = { reverse: {} };
  let output = "";

  rest.forEach((word) => {
    if (!isNaN(+word)) {
      _wordTurnCount = +word;
      _wordTurn = getCurrentWordTurn(_wordTurn);
      return;
    }

    if (_wordTurn === "dictionary") {
      _wordsCount += 1;
      getParsedDictionary(word, _dictionary);
    }

    if (_wordsCount === _wordTurnCount) {
      _wordTurnCount = 0;
      _wordsCount = 0;

      if (_wordTurn === "query") {
        _dictionary = { reverse: {} };
      }

      return;
    }

    if (_wordTurn === "query") {
      const [left, right] = word.split(" ");
      output += matchQuery(left, right, _dictionary);
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
