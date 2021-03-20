const Fs=require('fs')
const filePath='./content.json'

function save(content){
    const string=JSON.stringify(content)
    return Fs.writeFileSync(filePath,string,{encoding:'utf-8'})
}

function load(){
    const file=Fs.readFileSync(filePath,'utf-8')
    const contentJSON=JSON.parse(file)
    return contentJSON
}

module.exports={
    save,
    load
}