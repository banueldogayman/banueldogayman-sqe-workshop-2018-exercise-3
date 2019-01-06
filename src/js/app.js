import $ from 'jquery';
import { parseCode } from './code-analyzer';
import { parseBody } from './Parser';
import { getAns } from './Parser';
import { TableToFlow } from './flow-code';
import { getFinalGraph } from './flow-code';
import { restart } from './Parser';
import { Reset_3 } from './flow-code';
/*global flowchart */

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let input = $('#inputPlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let parsedCodeBody = parsedCode.body;
        parseBody(parsedCodeBody);
        let arr = getAns();
        let toPart3 = arr.slice();
        TableToFlow(toPart3, input);
        var text = getFinalGraph();
        test(text);
        restart();
        Reset_3();
        // console.log(JSON.stringify(parsedCode, null, 2));
    });


});
function test(text) {
    var diagram = flowchart.parse(text);
    diagram.drawSVG('diagram', {
        'x': 0,
        'y': 0, 'line-width': 3, 'line-length': 50, 'text-margin': 10, 'font-size': 14, 'font-color': 'black',
        'line-color': 'black',
        'element-color': 'black',
        'fill': 'white',
        'yes-text': 'T',
        'no-text': 'F',
        'arrow-end': 'block',
        'scale': 1,
        'symbols': {},
        'flowstate': {
            'green': { 'fill': 'green' },
        }
    });
}
function toPrint(toReturn, constTable) {
    var counterOfCon = 0;
    for (var i = 0; i < toReturn.length; i++) {
        if (toReturn[i].includes('if')) {
            if (constTable[counterOfCon].isTrue) {
                toReturn[i] = replaceAll(toReturn[i], ' ', '&nbsp;');
                $('#symbolicCode').append('<div style="background-color:green;width: 50%;">' + toReturn[i] + '</div>');
            }
            else {
                toReturn[i] = replaceAll(toReturn[i], ' ', '&nbsp;');
                $('#symbolicCode').append('<div style="background-color:red;width: 50%;">' + toReturn[i] + '</div>');
            }
            counterOfCon++;
        }
        else {
            toReturn[i] = replaceAll(toReturn[i], ' ', '&nbsp;');
            $('#symbolicCode').append(toReturn[i] + '<br />');
        }
    }
}



export { toPrint };


