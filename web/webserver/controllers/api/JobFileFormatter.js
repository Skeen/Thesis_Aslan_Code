

function arrToString(x) {
    var str=""
    for (var i = 0; i < x.length; i++) {
        if (i > 0) {
            str += " "
        }
        str += x[i].toString();
    }
    str += "\n";
    return str;
}

function docToString(doc) {
    var str = "";
    // console.log(doc);
    str += doc.tag.toString();
    str += " "
    str += doc._id.toString();
    str += "\n"
    str += arrToString(doc.derived.maxTS.fibTimes);
    str += arrToString(doc.derived.maxTS.startTimes);
    return str;
} 



module.exports = {
    docToString: docToString
}
