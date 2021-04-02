const { google } = require("googleapis");
const googleCustomSearch = google.customsearch("v1");
const download = require("image-downloader");
const gm = require("gm").subClass({ imageMagick: true });

const state = require("./state");
const googleCredentials = require("../credential/google-cloud.json");

async function image() {
  const content = state.load();

  // const imgs=await fetchGoogleImageURL('Michael Jackson')
  // await fetchAllImagesOfAllSentences(content)
  // state.save(content)
  // await downloadAllImages(content)
  // await convertAllImages(content);
  // await addSentencesToImages(content)
  await createThumbnail()
  async function fetchAllImagesOfAllSentences(content) {
    for (let sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      const imgs = await fetchGoogleImageURL(query);

      sentence.images = imgs;
      sentence.googleSearchImages = query;
    }
  }

  async function fetchGoogleImageURL(query) {
    const resp = await googleCustomSearch.cse.list({
      auth: googleCredentials.apiKey,
      cx: googleCredentials.searchEngineId,
      q: query,
      // Número de resultados da busca
      num: 2,
      searchType: "image",
      imgSize: "huge",
    });

    const extractLinksImages = resp.data.items.map((image) => image.link);
    return extractLinksImages;
  }
  async function downloadAllImages(content) {
    content.downloadedImages = [];
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const imagesSentence = content.sentences[sentenceIndex].images;

      for (
        let imagesIndex = 0;
        imagesIndex < imagesSentence.length;
        imagesIndex++
      ) {
        const imageURL = imagesSentence[imagesIndex];
        try {
          if (content.downloadedImages.includes(imageURL)) {
            throw new Error("Imagem já foi baixada");
          }
          await downloadImage(imageURL, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageURL);
          console.log(
            `Download realizado com sucesso,[${sentenceIndex}][${imagesIndex}] url da imagem: ${imageURL}`
          );
          break;
        } catch (error) {
          console.log(
            `Error ao tentar baixar a imagem [${sentenceIndex}][${imagesIndex}] ${imageURL}, descrição do error: ${error}`
          );
        }
      }
    }
  }
  async function downloadImage(url, filename) {
    return download.image({
      url,
      dest: `./content/${filename}`,
    });
  }
  async function convertAllImages(content) {
    for (let sententIndex=0;sententIndex<content.sentences.length;sententIndex++) {
      try {
        await convertImage(sententIndex);
      } catch (error) {
        console.log(
          `NÃO CONSEGUI PEGAR A IMAGEM ${sententIndex}. DESCRIÇÃO: ${error}`
        );
        break
      }
    }
  }
  async function convertImage(sententIndex) {
    return new Promise((resolve, reject) => {
      // tem o [0] pois se caso for um gif irá pegar a primeira imagem dele
      const inputIMG = `./content/${sententIndex}-original.png`;
      const outputIMG = `./content/${sententIndex}-converted.png`;
      // FullHD
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputIMG)
        .out("(")
            .out("-clone")
            .out("0")
            .out("-background", "white")
            .out("-blur", "0x9")
            .out("-resize", `${width}x${height}^`)
        .out(")")
        .out("(")
            .out("-clone")
            .out("0")
            .out("-background", "white")
            .out("-resize", `${width}x${height}`)
        .out(")")
        .out("-delete", "0")
        .out("-gravity", "center")
        .out("-compose", "over")
        .out("-composite")
        .out("-extent", `${width}x${height}`)
        .write(outputIMG, (err) => {
          if (err) {
            return reject(`início: ${inputIMG}, saída: ${outputIMG}`);
          }

          console.log("video-robot> image convertida: ", outputIMG);
          resolve();
        });
    });
  }
  async function addSentencesToImages(content){
    for(let sentenceIndex=0;sentenceIndex<content.sentences.length;sentenceIndex++){
      await createSentence(sentenceIndex,content.sentences[sentenceIndex].text)
    }
  }
  async function createSentence(sentenceIndex,text){
    return new Promise((resolve,reject)=>{
      const output=`./content/${sentenceIndex}-sentence.png`

      const templateSettings={
        0:{
          size:'1920x400',
          gravity:'center'
        },
        1:{
          size:'1920x1080',
          gravity:'center'
        },
        2:{
          size:'800x1080',
          gravity:'center'
        },
        3:{
          size:'1920x400',
          gravity:'center'
        },
        4:{
          size:'1920x1080',
          gravity:'center'
        },
        5:{
          size:'800x1080',
          gravity:'center'
        },
        6:{
          size:'1920x400',
          gravity:'center'
        }
      }

      gm()
        .out('-size',templateSettings[sentenceIndex].size)
        .out('-gravity',templateSettings[sentenceIndex].gravity)
        .out('-background','transparent')
        .out('-fill','white')
        .out('-kerning','-1')
        .out(`caption:${text}`)
        .write(output,(err)=>{
          if(err){
            return reject('Error ao criar Sentencia, error: ',err)
          }
          console.log(`robot>image: consegui criar a sentença: ${sentenceIndex}-sentence.png`)
          resolve()
        })

    })
  }
  async function createThumbnail(){
    return new Promise((resolve,reject)=>{
      gm()
      .in('./content/0-converted.png')
      .write('./content/thumbnail.png',(err)=>{
        if(err){
          return reject('Error ao converter a thumbnail.jpg')
        }
        console.log(`Thumbnail da imagem 0-converted.png foi criada com sucesso`)
        resolve()
      })
    })
  }
}

module.exports = image;
