
var mainTable = [];
var flowTable = [];
var definitions = [];
var flowDirections = [];
var flows = [];
var groupsArray = [];
var id = 0;
var ifInformation = [];
var valuesTable = [];
var inputVariables = [];
var toColor = [];
var finalGraph = '';
function TableToFlow(table, inputs) {
    mainTable = table;
    for (let index = 0; index < mainTable.length; index++) {
        var element = mainTable[index];
        if (element.line != 1) {
            if (checkIfLoops(element)) {
                var obj = { start: element.start, end: element.end, };
                ifInformation.push(obj);
            }
            Handler(element);
        }
        else if (index != 0) {
            inputVariables.push(element.name);
        }
    }
    run(mainTable, inputs, flowDirections);
    getFinalGraph();

}
function run(mainTable, inputs, flowDirections) {
    fillGroup(0, mainTable[0].start, mainTable[0].end);
    completeFlow();
    removeDoubleOperations();
    removeElse();
    flowToDefinitions();
    fillFlows();
    createFinalDirectaions();
    fillvaluesTable(inputs);
    calcauteFlow(flowDirections[0].next);
    prepareToFlowchart();
}
function calcauteFlow(name) {
    var currentName = name;
    if (!toColor.includes(currentName)) {
        toColor.push(currentName);
    }
    var currentElement = findDefinitionByName(currentName);
    if (currentElement.type == 'operation') {
        if (!currentElement.write.includes('return')) {
            calcauteOperation(currentElement);
            calcauteFlow(findNextInFlow(currentName));
        }
    } else {
        var ans = calcaulateCondition(currentElement.write.split('\n')[1]);
        if (ans) { calcauteFlow(findNextInFlowCondition(currentName, true)); }
        else { calcauteFlow(findNextInFlowCondition(currentName, false)); }
    }
}
function findNextInFlow(currentName) {
    for (let index = 0; index < flowDirections.length; index++) {
        const element = flowDirections[index];
        if (element.current == currentName) {
            return element.next;
        }
    }
}
function findNextInFlowCondition(currentName, isYes) {
    for (let index = 0; index < flowDirections.length; index++) {
        const element = flowDirections[index];
        if (element.current == currentName) {
            if (isYes)
                return element.nextTrue;
            return element.nextFalse;
        }
    }
}
function calcaulateCondition(condition) {
    return calcauteValue(condition);
}
function calcauteOperation(currentElement) {
    var lines = currentElement.write.split('\n'); var calculatedVaule;
    for (var i = 1; i < lines.length; i++) {
        var lineParts = lines[i].split(' = ');
        if (lineParts.length == 1) {
            var string = lines[i]; var string1 = string.substring(0, string.indexOf('+'));
            calculatedVaule = Number(ValueOf(string1)) + 1;
            insertToTable(string1, calculatedVaule);
        }
        else {
            calculatedVaule = calcauteValue(lineParts[1]);
            if (!lineParts[0].includes('[')) { insertToTable(lineParts[0], calculatedVaule); }
            else {
                var str1 = lineParts[0].substring(0, lineParts[0].indexOf('[')); var str2 = lineParts[0].split('[')[1].split(']')[0];
                var indexInTable = findValueIndex(str1); valuesTable[indexInTable].value[str2] = calculatedVaule;
            }
        }
    }
}
function insertToTable(name, value) {
    if (isInValuesTable(name)) {
        var indexInTable = findValueIndex(name);
        valuesTable[indexInTable].value = value;
    }
    else {
        var _name = name;
        var _value = value;
        var obj = {
            name: _name,
            value: _value
        };
        obj.type = checkType(_value);
        valuesTable.push(JSON.parse(JSON.stringify(obj)));
    }

}
function checkType(value) {
    if (value == 'false' || value == 'true') {
        return 'boolean';
    }
    else if (!(isNaN(Number(value)))) {
        return 'number';
    }
    else
        return 'string';
}
function findValueIndex(element) {
    for (let index = 0; index < valuesTable.length; index++) {
        var name = valuesTable[index].name;
        if (name == element)
            return index;
    }
}
function calcauteValue(expression) {
    var variables = expression.split(' '); var answer = '';
    for (var i = 0; i < variables.length; i++) {
        var element = variables[i]; element = removeBraclets(element);
        if (element.includes('[')) {
            element = calcauteArrayValue(element);
        }
        else if (isInValuesTable(element)) {
            element = calcauteValue1(element);
            if (typeof element == 'object') {
                return element;
            }
        }
        else { element = numbers(element); }
        answer += element;
    }
    return eval(answer);
}
function numbers(element) {
    if (!(isNaN(Number(element)))) {
        element = Number(element);
    }
    return element;
}
function calcauteValue1(element) {
    element = ValueOf(element);
    if (typeof element == 'string') {
        if (!element.includes('\''))
            element = '\'' + element + '\'';
    }
    return element;
}
function removeBraclets(element) {
    while (element.includes('(') || element.includes(')')) {
        if (element.includes('(')) {
            element = element.replace('(', '');
        }
        else
            element = element.replace(')', '');

    }
    return element;
}
function calcauteArrayValue(element) {
    var tempParts = element.split('[');
    var parts = [];
    parts.push(tempParts[0]);
    parts.push(tempParts[1].split(']')[0]);
    return valueOfArray(tempParts[0], tempParts[1].split(']')[0]);
}
function valueOfArray(nameElement, i) {
    for (let index = 0; index < valuesTable.length; index++) {
        var name = valuesTable[index].name;
        if (name == nameElement) {
            return valuesTable[index].value[i];
        }
    }
}
function isInValuesTable(element) {
    for (let index = 0; index < valuesTable.length; index++) {
        var name = valuesTable[index].name;
        if (name == element)
            return true;
    }
    return false;
}
function ValueOf(element) {
    for (let index = 0; index < valuesTable.length; index++) {
        var name = valuesTable[index].name;
        if (name == element)
            return valuesTable[index].value;
    }
}
function findDefinitionByName(name) {
    for (let index = 0; index < definitions.length; index++) {
        var element = definitions[index];
        if (element.name == name)
            return element;
    }
}
function fillvaluesTable(inputs) {
    inputs = checkArrays(inputs);
    var spiltInputs = inputs.split(',');
    var obj = {};
    for (let index = 0; index < spiltInputs.length; index++) {
        const element = spiltInputs[index];
        obj = createObjectType(obj, index, element);
        valuesTable.push(JSON.parse(JSON.stringify(obj)));
    }

}
function createObjectType(obj, index, element) {
    if (element.startsWith('\'')) {
        obj.type = 'string';
        obj.value = element;
    }
    else if (element.startsWith('[')) {
        obj.type = 'array';
        obj.value = insertToArr(element);
    }
    else if (element == 'true' || element == 'false') {
        obj.type = 'boolean';
        obj.value = element;
    }
    else {
        obj.type = 'number';
        obj.value = Number(element);
    }
    obj.name = inputVariables[index];
    return obj;
}
function insertToArr(element) {
    element = element.substring(1, element.length - 1);
    element = element.split('*');
    return element;
}
function checkArrays(str) {
    var betweenArray = false;
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == '[') {
            betweenArray = true;
        }
        else if (str.charAt(i) == ']') {
            betweenArray = false;
        }
        if (betweenArray) {
            str = changeArr(str, i);
        }
    }
    return str;
}
function changeArr(str, i) {
    if (str.charAt(i) == ',') {
        str = setCharAt(str, i, '*');
    }
    return str;
}
function setCharAt(str, index, chr) {
    return str.substr(0, index) + chr + str.substr(index + 1);
}
function prepareToFlowchart() {
    var definitionsString = '';
    var flowsString = '';
    var opsToColor = toColor;
    for (let index = 0; index < definitions.length; index++) {
        var def = definitions[index];
        if (!(def.name == 'e'))
            if (opsToColor.includes(def.name)) {
                definitionsString += def.name + '=>' + def.type + ': ' + def.write + '|green' + '\n';
            }
            else {
                definitionsString += def.name + '=>' + def.type + ': ' + def.write + '\n';
            }
    }
    flowsString = prepareToFlowchart1(flowsString);
    finalGraph = definitionsString + '\n' + flowsString;
}
function prepareToFlowchart1(flowsString) {
    for (let index = 0; index < flows.length; index++) {
        var flo = flows[index] + '';
        if (!(flo.includes('->e')))
            flowsString += flo + '\n';
    }
    return flowsString;

}
function pushOperation(element) {
    flowTable.push({
        type: 'operation',
        name: element.name + ' = ' + element.value,
        id,
        start: element.start,
        end: element.end,
    });
}
function pushCondition(element) {
    flowTable.push({
        type: 'condition',
        condition: element.condition,
        id,
        start: element.start,
        end: element.end,
        true: '',
        false: '',
        inIf: false,
        condType: element.type,
    });
}
function pushReturn(element) {
    flowTable.push({
        type: 'operation return',
        return: 'return ' + element.value,
        id,
        start: element.start,
        end: element.end,
    });
}
function pushUpdate(element) {
    flowTable.push({
        type: 'operation',
        name: element.value,
        id,
        start: element.start,
        end: element.end,
    });
}
function Handler(element) {
    id++;
    if (checkIfVariable(element)) {
        pushOperation(element);
    }
    else if (checkIfLoops(element)) {
        pushCondition(element);
    }
    else if (element.type == 'return statement') {
        pushReturn(element);
    }
    else {
        pushUpdate(element);
    }
}
function checkIfVariable(element) {
    if (element.type == 'variable declaration' || element.type == 'assignment expression') {
        return true;
    }
    return false;
}
function findElementIndexInGroup(element) {
    var members = groupsArray[element.groupId].members;
    for (let index = 0; index < members.length; index++) {
        if (members[index].id == element.id) {
            return index;
        }

    }
}
function completeFlow() {
    for (let index = 0; index < flowTable.length; index++) {
        var element = flowTable[index];
        if (element.type == 'operation') {
            var groupIndex = findElementIndexInGroup(element);
            element.next = findNextInGroup(element.groupId, groupIndex);
        }
        else if (element.type == 'condition') {
            var groundIndexCond = findElementIndexInGroup(element);
            element.true = findFirstMember(groundIndexCond, element.groupId);
            if (element.condType != 'else statement') {
                element.false = findNextInGroupIf(element.groupId, groundIndexCond);
            }
        }
    }
}
function findFirstMember(groupIndex, groupId) {
    for (let index = 0; index < groupsArray.length; index++) {
        var element = groupsArray[index];
        if (element.father == groupId && element.indexOfFather == groupIndex) {
            return element.members[0];
        }
    }
}
function fillGroup(groupId, startLine, endLine) {
    for (let index = 0; index < flowTable.length; index++) {
        var element = flowTable[index];
        if (checkIfInGroup(element, startLine, endLine)) {
            if (!groupsArray[groupId])
                groupsArray[groupId] = { members: [] };
            groupsArray[groupId].members.push(element);
            element.groupId = groupId;
            if (element.type == 'condition') {
                var nextGroup = groupsArray.length;
                var indexOfFather = groupsArray[groupId].members.length - 1;
                fillGroup(nextGroup, element.start, element.end);
                groupsArray[nextGroup].father = groupId;
                groupsArray[nextGroup].indexOfFather = indexOfFather;
            }
        }
    }
}
function checkIfInGroup(element, startLine, endLine) {
    if (element.start > startLine && element.end < endLine && !(element.groupId)) {
        return true;
    }
    return false;
}
function findNextInGroup(groupId, indexInGroup) {
    var members = groupsArray[groupId].members;
    for (var i = indexInGroup + 1; i < members.length; i++) {
        if (members[i].condType != 'else if statement' && members[i].condType != 'else statement') {
            return members[i];
        }
    }
    if (groupsArray[groupsArray[groupId].father].members[groupsArray[groupId].indexOfFather].condType == 'while statement') {
        return groupsArray[groupsArray[groupId].father].members[groupsArray[groupId].indexOfFather];
    }
    return findNextInGroup(groupsArray[groupId].father, groupsArray[groupId].indexOfFather);
}
function findNextInGroupIf(groupId, indexInGroup) {
    var members = groupsArray[groupId].members;
    if (members[indexInGroup + 1])
        return members[indexInGroup + 1];
    if (groupsArray[groupsArray[groupId].father].members[groupsArray[groupId].indexOfFather].condType == 'while statement') {
        return groupsArray[groupsArray[groupId].father].members[groupsArray[groupId].indexOfFather];
    }
    return findNextInGroup(groupsArray[groupId].father, groupsArray[groupId].indexOfFather);

}
function checkIfLoops(element) {
    if (element.type == 'else statement' || element.type == 'if statement' || element.type == 'else if statement' || element.type == 'while statement')
        return true;
    return false;
}

function removeDoubleOperations() {
    for (let index = 0; index < flowTable.length; index++) {
        var element = flowTable[index];
        if (element.type == 'operation') {
            if (flowTable[index + 1].type == 'operation' && (flowTable[index + 1].start == element.start + 1)) {
                element.name += '\n' + flowTable[index + 1].name;
                var temp = flowTable[index + 1].next;
                element.start = flowTable[index + 1].start;
                flowTable.splice(flowTable.indexOf(flowTable[index + 1]), 1);
                element.next = temp;
                index--;
            }
        }

    }
}
function removeElse() {
    for (let index = 0; index < flowTable.length; index++) {
        var element = flowTable[index];
        if (element.type == 'condition' && element.false.condType == 'else statement') {
            var toDelete = element.false;
            element.false = toDelete.true;
            flowTable.splice(flowTable.indexOf(toDelete), 1);
        }

    }
}
function pushStart() {
    definitions = [{
        name: 'st',
        type: 'start',
        write: 'Start'
    }, {
        name: 'e',
        type: 'end',
        write: 'End'
    }];
}
function flowToDefinitions() {
    pushStart();
    var countop = 1; var counntcond = 1; var array = flowTable;
    for (let index = 0; index < array.length; index++) {
        const element = array[index]; var counter = index + 1; var name = '';
        if (element.type == 'operation') {
            name = 'op' + countop;
            definitions.push({ name: name, type: 'operation', write: '(' + counter + ')' + '\n' + element.name, index: index, id: element.id, });
            countop++;
        } else if (element.type == 'condition') {
            name = 'cond' + counntcond;
            definitions.push({ name: 'cond' + counntcond, type: 'condition', write: '(' + counter + ')' + '\n' + element.condition, index: index, id: element.id, });
            counntcond++;
        } else {
            name = 'op' + countop;
            definitions.push({ name: 'op' + countop, type: 'operation', write: '(' + counter + ')' + '\n' + element.return, index: index, id: element.id, });
            countop++;
        }
    }
}
function pushFlows() {
    flowDirections.push({
        current: definitions[0].name,
        next: definitions[2].name,
    });
    flowDirections.push({
        current: definitions[definitions.length - 1].name,
        next: definitions[1].name,
    });
}
function fillFlows() {
    pushFlows();
    for (var i = 0; i < definitions.length - 1; i++) {
        if (definitions[i].type == 'operation') {
            var operation = flowTable[definitions[i].index];
            var nextId = operation.next.id;
            var nextName = findNameById(nextId);
            flowDirections.push({
                current: definitions[i].name,
                next: nextName,
            });
        }
        else if (definitions[i].type == 'condition') {
            pushDefCond(i);
        }
    }
}
function pushDefCond(i) {
    var condition = flowTable[definitions[i].index];
    var nextTrueId = condition.true.id;
    var nextFalseId = condition.false.id;
    var nextTrueName = findNameById(nextTrueId);
    var nextFalseName = findNameById(nextFalseId);
    flowDirections.push({
        current: definitions[i].name,
        nextTrue: nextTrueName,
        nextFalse: nextFalseName,
    });
}
function findNameById(Id) {
    for (let index = 0; index < definitions.length; index++) {
        const element = definitions[index];
        if (element.id == Id)
            return element.name;
    }
}

function createFinalDirectaions() {
    for (let index = 0; index < flowDirections.length; index++) {
        var element = flowDirections[index];
        if (element.current.includes('cond')) {
            flows[flows.length] = element.current + '(yes)->' + element.nextTrue;
            flows[flows.length] = element.current + '(no)->' + element.nextFalse;
        }
        else {
            flows[flows.length] = element.current + '->' + element.next;
        }
    }
}
function getFinalGraph() {
    return finalGraph;
}
function Reset_3() {
    mainTable = [];
    flowTable = [];
    definitions = [];
    flowDirections = [];
    flows = [];
    groupsArray = [];
    id = 0;
    ifInformation = [];
    valuesTable = [];
    inputVariables = [];
    toColor = [];
    finalGraph = '';
}


function getInformation() {
    return [flowTable, definitions, flows, groupsArray, valuesTable, toColor];
}
export { TableToFlow };
export { getFinalGraph };
export { checkType };
export { removeBraclets };
export { insertToArr };
export { checkArrays };
export { checkIfVariable };
export { checkIfLoops };
export { checkIfInGroup };
export { Reset_3 };
export { getInformation };
