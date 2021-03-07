const algorithmia = require("algorithmia");
const algorithmiaCredentials = require("../credential/algorithmia.json");
const SentenceBoundaryDetection=require('sbd')

async function robot(content) {
  await searchTermWikipedia(content);
  formatingContent(content);
  breakContentIntoSentences(content)

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

    const whithOutDatesInParentheses=removeDates(whithoutBlankLinesAndMarkdowns)
    content.SourceContentSanitized=whithOutDatesInParentheses

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
  function removeDates(text){
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }
  function breakContentIntoSentences(content){
      content.sentences=[]
      const sentences=SentenceBoundaryDetection.sentences(content.SourceContentSanitized)
      sentences.forEach(sentence=>{
          content.sentences.push({
                text:sentence,
                keywords:[],
                images:[]
          })
      })
      
      
  }
}

module.exports = robot;
