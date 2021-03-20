const {google} = require('googleapis');
const googleCustomSearch=google.customsearch('v1')
const download = require('image-downloader')

const state=require('./state')
const googleCredentials=require('../credential/google-cloud.json')

async function image(){
    const content=state.load()

    // const imgs=await fetchGoogleImageURL('Michael Jackson')
    // await fetchAllImagesOfAllSentences(content)
    // state.save(content)
    await downloadAllImages(content)
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
    async function downloadAllImages(content){
        content.downloadedImages=[]
        for(let sentenceIndex=0;sentenceIndex<content.sentences.length;sentenceIndex++){
            const imagesSentence=content.sentences[sentenceIndex].images

            for(let imagesIndex=0;imagesIndex<imagesSentence.length;imagesIndex++){
                const imageURL=imagesSentence[imagesIndex]
                try {
                    if(content.downloadedImages.includes(imageURL)){
                        throw new Error('Imagem já foi baixada')
                    }
                    await downloadImage(imageURL,`${sentenceIndex}+${imagesIndex}-original.png`)
                    content.downloadedImages.push(imageURL)
                    console.log(`Download realizado com sucesso,[${sentenceIndex}][${imagesIndex}] url da imagem: ${imageURL}`)
                    break
                } catch (error) {
                    console.log(`Error ao tentar baixar a imagem [${sentenceIndex}][${imagesIndex}] ${imageURL}, descrição do error: ${error}`)
                }
            }
        }
    }
    async function downloadImage(url,filename){
        return download.image({
            url,
            dest:`./content/${filename}`
        })
    }
}

module.exports=image