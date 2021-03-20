const algorithmia = require("algorithmia");
const algorithmiaCredentials = require("../credential/algorithmia.json");
const SentenceBoundaryDetection = require("sbd");

const watsonApiKey = require("../credential/watson.json").apikey;
const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: "2018-04-05",
  serviceUrl:
    "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com",
});
const state=require('./state')

async function robot() {
  const content=state.load()
  await searchTermWikipedia(content);
  formatingContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fetchKeywordsOfAllSentence(content);

  state.save(content)

  async function searchTermWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaCredentials.apiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
      "web/WikipediaParser/0.1.2"
    );
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponde.get();
    content.SourceContentOriginal = wikipediaContent.content;
  }

  function formatingContent(content) {
    const whithoutBlankLinesAndMarkdowns = removeBlanksLines(
      content.SourceContentOriginal
    );

    const whithOutDatesInParentheses = removeDates(
      whithoutBlankLinesAndMarkdowns
    );
    content.SourceContentSanitized = whithOutDatesInParentheses;

    function removeBlanksLines(text) {
      const allLines = text.split("\n");
      const withoutBlankLinesandMarks = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith("==")) {
          return false;
        }
        return true;
      });

      return withoutBlankLinesandMarks.join(" ");
    }
  }
  function removeDates(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g, " ");
  }
  function breakContentIntoSentences(content) {
    content.sentences = [];
    const sentences = SentenceBoundaryDetection.sentences(
      content.SourceContentSanitized
    );
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: [],
      });
    });
  }
  function limitMaximumSentences(content) {
    // Adiciona no sentences somente as 7 primeiras
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }
  async function fetchKeywordsOfAllSentence(content) {
    // content.sentences.forEach(sentence=>{
    //   sentence.keywords=await fetchWatsonAndReturnKeywords(sentence.text)
    // })
    for (let sentence of content.sentences) {
      // console.log('sentence ',sentence.text)
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
  }
  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu
        .analyze({
          text: sentence,
          features: {
            concepts: {},
            keywords: {},
          },
        })
        .then((response) => {
          // console.log(JSON.stringify(response.keywords, null, 2));
          const text = response.result.keywords.map((re) => re.text);
          resolve(text);
        })
        .catch((err) => {
          console.log("error: ", err);
          reject(err);
        });
    });
  }
}

module.exports = robot;
