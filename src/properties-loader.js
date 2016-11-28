const Path = require('path')
var props = require('./test-properties.json')
var callsite = require('callsite')

module.exports.gameConsts = props.gameConsts
module.exports.p4ngIndex = Path.join(__dirname,props.p4ngIndex)

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
