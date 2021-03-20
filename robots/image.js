const {google} = require('googleapis');
const googleCustomSearch=google.customsearch('v1')

const state=require('./state')
const googleCredentials=require('../credential/google-cloud.json')

async function image(){
    const content=state.load()

    // const imgs=await fetchGoogleImageURL('Michael Jackson')
    await fetchAllImagesOfAllSentences(content)
    console.dir(content,{depth:null})
    process.exit(0)

    async function fetchAllImagesOfAllSentences(content){
        for(let sentence of content.sentences){
            const query=`${content.searchTerm} ${sentence.keywords[0]}`
            const imgs=await fetchGoogleImageURL(query)

            sentence.images=imgs
            sentence.googleSearchImages=query

        }
    }

    async function fetchGoogleImageURL(query){
        const resp=await googleCustomSearch.cse.list({
            auth:googleCredentials.apiKey,
            cx:googleCredentials.searchEngineId,
            q:query,
            // Número de resultados da busca
            num:2,
            searchType:'image',
            imgSize:'huge'
        })

        const extractLinksImages=resp.data.items.map(image=>image.link)
        return extractLinksImages

    }  
}

module.exports=image