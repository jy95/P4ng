const Path = require('path')
process.argv.forEach(function(val, i){console.log(`${i}: ${val}`)})
var propertiesPath = process.argv[2]
var props = require(propertiesPath ? propertiesPath : './properties.json')
var callsite = require('callsite')

module.exports.gameConsts = props.gameConsts
module.exports.p4ngIndex = Path.join(__dirname,props.p4ngIndex)
module.exports.p4ngIcon = Path.join(__dirname,props.p4ngIcon)
module.exports.socketProps = props.socketProps

for(let m in props.p4ngModules)
    module.exports[m+'Path'] = makePathSolver(Path.resolve(__dirname, props.p4ngModules[m]),Path)

// makes relative path finder
// closures yay
function makePathSolver(absolutePath, pathModule){
    return function(){
        var stack = callsite()
        requester = stack[1].getFileName()
        var found = pathModule.relative(pathModule.dirname(requester), absolutePath)
        return './'+found
    }
}
