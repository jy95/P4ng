const path = require('path')
var props = require('./properties.json')

for(let m in props.p4ngModules)
    props.p4ngModules[m] = Path.resolve(__dirname, props.p4ngModules[m])

module.exports = props
