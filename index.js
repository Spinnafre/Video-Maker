const readLine=require('readline-sync')
const robot={text:require('./robots/text')}
async function start(){
    const content={}

    content.searchTerm=askAndReturnSearchTerm()
    content.prefix=askReturnPrefix()
    await robot.text(content)

    function askAndReturnSearchTerm(){
        return readLine.question("Type a Wikipedia search term?")
    }

    function askReturnPrefix(){
        const prefixes=['Who is','What is','The history of']

        const prefixKey=readLine.keyInSelect(prefixes,'Choose one option: ')
        const loadPrefix=prefixes[prefixKey]
        return loadPrefix
        
    }
    console.log(content)

}
start()