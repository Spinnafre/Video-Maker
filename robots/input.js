const readLine=require('readline-sync')
const state=require('./state')


function input(){
    const content={
        // TAMANHO MÁXIMO DO CONTEÚDO
        maximumSentences:7
    }
    
    content.searchTerm=askAndReturnSearchTerm()
    content.prefix=askReturnPrefix()
    
    state.save(content)
    function askAndReturnSearchTerm(){
        return readLine.question("Type a Wikipedia search term?")
    }
    
    function askReturnPrefix(){
        const prefixes=['Who is','What is','The history of']
    
        const prefixKey=readLine.keyInSelect(prefixes,'Choose one option: ')
        const loadPrefix=prefixes[prefixKey]
        return loadPrefix
        
    }
}

module.exports=input