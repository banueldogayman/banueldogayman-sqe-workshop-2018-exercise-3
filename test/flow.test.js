import assert from 'assert';
import { parseBody } from '../src/js/Parser';
import { restart } from '../src/js/Parser';
import { getAns } from '../src/js/Parser';
import { checkType } from '../src/js/flow-code';
import { removeBraclets } from '../src/js/flow-code';
import { insertToArr } from '../src/js/flow-code';
import { checkArrays } from '../src/js/flow-code';
import { checkIfVariable } from '../src/js/flow-code';
import { checkIfLoops } from '../src/js/flow-code';
import { checkIfInGroup } from '../src/js/flow-code';
import { Reset_3 } from '../src/js/flow-code';
import { TableToFlow } from '../src/js/flow-code';
import { getInformation } from '../src/js/flow-code';
import { parseCode } from '../src/js/code-analyzer'





describe('checkType', () => {
  it('checkType_string', () => {
    var ans = checkType('string');
    assert.equal(
      ans,
      'string'
    );

  });

  it('checkType_boolean', () => {
    var ans = checkType('false');
    assert.equal(
      ans,
      'boolean'
    );
  });
  it('checkType_number', () => {
    var ans = checkType(1);
    assert.equal(
      ans,
      'number'
    );
  });
});
describe('removeBraclets', () => {
  it('removeBraclets_left', () => {
    var ans = removeBraclets('(z');
    assert.equal(
      ans,
      'z'
    );
  });
  it('removeBraclets_right', () => {
    var ans = removeBraclets('z)');
    assert.equal(
      ans,
      'z'
    );
  });
});
describe('insertToArr', () => {
  it('insertToArr', () => {
    var ans = insertToArr('[1*2*3]');
    assert.equal(
      ans[0],
      '1'
    );
  });
});
describe('checkArrays', () => {
  it('checkArrays', () => {
    var ans = checkArrays('[1,2,3]');
    assert.equal(
      ans,
      '[1*2*3]'
    );
  });
});
describe('checkIfVariable', () => {
  it('checkIfVariable_variable', () => {
    var ans = checkIfVariable({ type: 'variable declaration' });
    assert.equal(
      ans,
      true
    );
  });
  it('checkIfVariable_Notvariable', () => {
    var ans = checkIfVariable({ type: 'variable1 declaration' });
    assert.equal(
      ans,
      false
    );
  });
});
describe('checkIfLoops', () => {
  it('checkIfLoops_loop', () => {
    var ans = checkIfLoops({ type: 'else statement' });
    assert.equal(
      ans,
      true
    );
  });
  it('checkIfLoops_NotLoop', () => {
    var ans = checkIfLoops({ type: 'variable1 declaration' });
    assert.equal(
      ans,
      false
    );
  });
});
describe('checkIfInGroup', () => {
  it('checkIfInGroup_yes', () => {
    var ans = checkIfInGroup({ start: 1, end: 5 }, 0, 7);
    assert.equal(
      ans,
      true
    );
  });
  it('checkIfInGroup_no', () => {
    var ans = checkIfInGroup({ start: 1, end: 5 }, 6, 7);
    var ans = checkIfInGroup({ type: 'variable1 declaration' });
    assert.equal(
      ans,
      false
    );
  });
});
describe('SimpleIF', () => {
  it('SimpleIf_number', () => {
    var codeToParse = `function foo(x, y, z){
      let a = x + 1;
      let b = a + y;
      let c = 0;

      if (b < z) {
          c = c + 5;
      } else if (b < z * 2) {
          c = c + x + 5;
      } else {
          c = c + z + 5;
      }

      return c;
  }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,2,3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[0][2].id,
      5
    );
    restart();
    Reset_3();
  });

  it('SimpleIf_arrays', () => {
    var codeToParse = `function foo(x, y, z){
      let a = x[0] + 1;
      let b = a + y;
      let c = 0;

      if (z) {
          c = c + 5;
      } else if (b < x[1] * 2) {
          c = c + x + 5;
      } else {
          c = c + z + 5;
      }

      return c;
  }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '[1,2],2,false';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[3][0].members.length,
      7
    );
    restart();
    Reset_3();
  });

});

describe('SimpleWhile', () => {
  it('SimpleWhile_number', () => {
    var codeToParse = `function foo(x, y, z){
      let a = x + 1;
      let b = a + y;
      let c = 0;

      while (a < z) {
          c = a + b;
          a++;
      }

      return z;
   }   
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,2,3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[4][2].name,
      'z'
    );
    restart();
    Reset_3();
  });
  it('SimpleWhile_string', () => {
    var codeToParse = `function foo(x, y, z){
      let a = x + 1;
      let b = y;
      let c = 0;

      while (b=='dog') {
          c = a + b;
          z = c * 2;
          a++;
          b='cat';
      }

      return z;
   }   
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = "1,'dog',2";
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[2][0],
      'st->op1'
    );
    restart();
    Reset_3();
  });

  it('DoubleWhile', () => {
    var codeToParse = `function foo(x, y, z) {
      while (z > 2) {
        while (y < z + 1){
          x=2;
          z=z-1;
        }
        z=z-1;
        if(x==2){
          x=2;
        }
       
      }
      return x;
    }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,2,3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[1][1].name,
      'e'
    );
    restart();
    Reset_3();
  });
  it('Complex_while+if', () => {
    var codeToParse = `function foo(x, y, z) {
      while (z > 2) {
        if (y < z + 1) {
          x = 12;
        }
        else if (y == z * 2) {
          y++;
        }
        else {
          z = 2;
        }
        x == 11;
        z=z-1;
      }
      return x;
    }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,2,3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[4][1].name,
      'y'
    );
    restart();
    Reset_3();
  });
  it('Complex_if+if', () => {
    var codeToParse = `function foo(x, y, z) {
      if(z > 2) {
        if (y < z + 1) {
          x = 12;
        }
        else if (y == z * 2) {
          y++;
        }
        else {
          z = 2;
        }
        x == 11;
      }
      return x;
    }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,2,3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[5][1],
      'cond2'
    );
    restart();
    Reset_3();
  });
  it('Complex_if+if_2', () => {
    var codeToParse = `function foo(x, y, z) {
      if(z > 2) {
        if (y[1] < z + 1) {
          x = 12;
        }
      }
      else{
        x=2;
      }
      return x;
    }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '1,[1,2],3';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[5][1],
      'cond2'
    );
    restart();
    Reset_3();
  });
  it('Array_tests', () => {
    var codeToParse = `function foo(x) {
      var a=x;
      a[2]=6;
      return z;
  }
  `;
    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let arr = getAns();
    var inputs = '[1,2,3]';
    TableToFlow(arr, inputs);
    var ans = getInformation();
    assert.equal(
      ans[5][1],
      'op2'
    );
    restart();
    Reset_3();
  });
});
describe('Parser', () => {
  it('For', () => {
    var codeToParse = `function foo() {
      var array;
      var x;
      var h = 0;
      var l = 4;
      for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if (element == (h + 2) / 2) {
              x = 2;
          }
          else if (element > (h + 2) / 2){
            x=3;
          }
          else if (x==2){
            x=4;
            return c;
          }
          else if (x==3){y=2;}
          else{
            const element = array[index];  
            const element = array[index];  
            const element = array[index];  
          }
      }
      for ( index = (h+2); index < array.length; index=index+1) {
        const element = array[index];    
      }
      for ( index = 0; index < array.length; index=index+1) {
        const element = array[index+2];    
      }
      var y=9;
      var c;
      c=y;
      x='false';
      x='cat';
      x++;
      return x+1;
  }  
  `;

    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let ans = getAns();
    assert.equal(
      ans[0].name,
      'foo'
    );
    restart();
    Reset_3();
  });
  it('IFs', () => {
    var codeToParse = `function binarySearch(X, V, n){
      let low, high, mid;
      low = 0;
      high = n - 1;
      x=false;
      x='false';
      while (low <= high) {
          mid = (low + high)/2;
          if (X < V[mid])
              high = mid - 1;
          else if (X > V[mid])
              low = mid + 1;
          else
              return mid;
      }
      return -1;
    }
  `;

    let parsedCode = parseCode(codeToParse);
    let parsedCodeBody = parsedCode.body;
    parseBody(parsedCodeBody);
    let ans = getAns();
    assert.equal(
      ans[0].name,
      'binarySearch'
    );
    restart();
    Reset_3();
  });
});
