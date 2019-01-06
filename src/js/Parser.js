var ans = [];
var line = 0;
function parseBody(toParse) {

    if (toParse.type == 'BlockStatement') {
        parseBody(toParse.body);
        return;
    }

    for (var i = 0; i < toParse.length; i++) {
        line++;
        CheckType1(toParse[i]);
        CheckType2(toParse[i]);
        CheckType3(toParse[i]);
        if (toParse[i].body)
            parseBody(toParse[i].body);
    }
}


function CheckType1(object) {
    if (object.type == 'FunctionDeclaration') {
        FunctionDeclarationHandler(object);
    } else if (object.type == 'VariableDeclaration') {
        VariableDeclarationHandler(object);

    } else if (object.type == 'ExpressionStatement') {
        ExpressionStatementHandler(object);
    }
}
function CheckType2(object) {
    if (object.type == 'WhileStatement' || object.type == 'ElseStatement' || object.type == 'IfStatement') {
        LoopsHandler(object);
    }
}
function CheckType3(object) {
    if (object.type == 'ReturnStatement') {
        ReturnStatementHandler(object);
    } else if (object.type == 'ForStatement') {
        ForStatementHandler(object);
    }
}
function FunctionDeclarationHandler(object) {
    var obj = {
        line,
        type: 'function declaration',
        name: object.id.name,
        condition: '',
        value: '',
        start: object.loc.start.line,
        end: object.loc.end.line
    };
    ans.push(obj);
    if (object.params.length > 0) {
        ParamsDeclarationHandler(object);
    }
    return obj;
}

function ParamsDeclarationHandler(object) {
    for (var j = 0; j < object.params.length; j++) {
        var obj = {
            line,
            type: 'variable declaration',
            name: object.params[j].name,
            condition: '',
            value: '',
            start: object.params[j].loc.start.line,
            end: object.params[j].loc.end.line
        };
        ans.push(obj);
    }
}
function VariableDeclarationHandler(object) {
    for (var j = 0; j < object.declarations.length; j++) {
        var obj = SetVariable(object, j);
        if (object.declarations[j].init) {
            obj.value = ExpParser(object.declarations[j].init) + '';
            if (obj.value.startsWith('(')) {
                obj.value = obj.value.substring(1, obj.value.length - 1);
            }
        }
        else {
            obj.value = '';
        }
        obj.start = object.loc.start.line;
        obj.end = object.loc.end.line;
        ans.push(obj);
        return obj;
    }
}
function SetVariable(object, j) {
    var obj = {
        line,
        type: 'variable declaration',
        name: object.declarations[j].id.name,
        condition: '',
    };
    return obj;
}
function ExpressionStatementHandler(object) {
    var express = object.expression;
    var obj = {
        line, condition: '', start: object.loc.start.line, end: object.loc.end.line
    };
    if (express.type == 'UpdateExpression') {
        obj.type = 'update expression';
        obj.value = express.argument.name + express.operator;
        obj.name = express.argument.name;
    }
    else {
        obj.type = 'assignment expression';
        obj.name = ExpParser(express.left) + '';
        obj.value = ExpParser(express.right) + '';
    }
    if (obj.value.startsWith('(')) {
        obj.value = obj.value.substring(1, obj.value.length - 1);
    }
    ans.push(obj);
}
function LoopsHandler(object) {
    var obj = {
        line, name: '', value: '', start: object.loc.start.line,
    };
    obj.type = whichType(object);
    if (object.type == 'IfStatement' || object.type == 'ElseStatement') {
        if (object.alternate) {
            obj.end = object.alternate.loc.start.line;
        } else { obj.end = object.loc.end.line; }
    } else { obj.end = object.loc.end.line; }
    obj.condition = ExpParser(object.test) + '';
    if (obj.condition.startsWith('(')) { obj.condition = obj.condition.substring(1, obj.condition.length - 1); }
    ans.push(obj);
    checkElseIf(object);
    checkElse(object);


}
function whichType(object) {
    if (object.type == 'WhileStatement') {
        return 'while statement';
    }
    else if (object.type == 'ElseStatement') {
        return 'else if statement';
    }
    else {
        return 'if statement';
    }
}
function checkElseIf(object) {
    if (object.type == 'ElseStatement' || object.type == 'IfStatement') {
        if (object.consequent.type == 'BlockStatement') {
            parseBody(object.consequent);
        }
        else {
            parseBody([object.consequent]);
        }

    }
}
function checkElse(object) {
    if (object.alternate) {
        var obj1 = JSON.parse(JSON.stringify(object.alternate));
        if (obj1.type == 'IfStatement') {
            obj1.type = 'ElseStatement';
        }
        if (obj1.type != 'ElseStatement') {
            ans.push({
                line: line + 1,
                type: 'else statement',
                name: '',
                value: '',
                condition: '', start: obj1.loc.start.line, end: obj1.loc.end.line,

            });
        }
        parseBody([obj1]);
    }
}
function ReturnStatementHandler(object) {
    var obj = {
        line,
        name: '',
        condition: '',
        type: 'return statement',
        start: object.loc.start.line,
        end: object.loc.end.line
    };
    obj.value = ExpParser(object.argument) + '';
    if (obj.value.startsWith('(')) {
        obj.value = obj.value.substring(1, obj.value.length - 1);
    }
    ans.push(obj);
}
function ForStatementHandler(object) {
    var init = ForInitHandler(object);
    var test = ExpParser(object.test) + '';

    test = test.substring(1, test.length - 1);

    var update = ForUpdateHandler(object);
    var obj = {
        line,
        name: '',
        condition: init + ' ; ' + test + ' ; ' + update,
        type: 'for statement',
        value: ''

    };
    ans.push(obj);

}

function ForInitHandler(object) {
    var obj;
    if (object.init.type == 'VariableDeclaration') {
        obj = VariableDeclarationHandler(object.init);
    }
    else {
        obj = SetObj(object);

        obj.value = ExpParser(object.init.right) + '';
        if (obj.value.startsWith('(')) {
            obj.value = obj.value.substring(1, obj.value.length - 1);
        }
        ans.push(obj);
    }
    return SetInit(object, obj);
}
function SetInit(object, obj) {
    var init;
    if (object.init.kind)
        init = object.init.kind + ' ' + obj.name + ' = ' + ' ' + obj.value;
    else
        init = obj.name + ' = ' + ' ' + obj.value;
    return init;
}
function SetObj(object) {
    var obj1 = {
        line,
        name: object.init.left.name,
        condition: '',
        type: 'assignment expression'
    };
    return obj1;
}
function ForUpdateHandler(object) {
    var update;
    if (object.update.type == 'UpdateExpression') {
        update = object.update.argument.name + object.update.operator;
    }
    else {
        update = ExpParser(object.update.right) + '';
        update = update.substring(1, update.length - 1);
        update = object.update.left.name + ' = ' + update;
    }
    return update;
}
function ExpParser(exp) {
    if (exp.type == 'BinaryExpression') {
        var operator = exp.operator;
        return ('(' + ExpParser(exp.left) + ' ' + operator + ' ' + ExpParser(exp.right) + ')');
    }
    return SimpleExp(exp);

}
function SimpleExp(exp) {
    if (exp.type == 'Literal') {
        return SimpleExp2(exp);
    } else if (exp.type == 'Identifier') {
        return exp.name;
    } else return SimpleExp1(exp);
}
function SimpleExp2(exp) {
    if (exp.raw && exp.value != false && exp.value != true)
        return exp.raw;
    return exp.value;
}
function SimpleExp1(exp) {
    if (exp.type == 'MemberExpression') {
        var string = ExpParser(exp.property) + '';
        string = ifBra(string);
        if (string == 'length') {
            return exp.object.name + '.length';
        }
        return exp.object.name + '[' + string + ']';
    } else {
        return exp.operator + exp.argument.value;
    }
}
function ifBra(string) {
    if (string.startsWith('(')) {
        string = string.substring(1, string.length - 1);
    }
    return string;
}

function getAns() {
    return ans;
}
function restart() {
    ans = [];
    line = 0;
}
export { parseBody };
export { getAns };
export { restart };

