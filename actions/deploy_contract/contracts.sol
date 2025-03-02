// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 public storedValue;

    constructor(uint256 _initialValue) {
        storedValue = _initialValue;
    }

    function set(uint256 _value) public {
        storedValue = _value;
    }
}

contract SimpleCounter {
    uint256 public counter;

    function increment() public {
        counter++;
    }

    function decrement() public {
        counter--;
    }
}

contract Greeter {
    string public greeting;

    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}

contract HelloWorld {
    string public message = "Hello World";
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}

contract BasicCalculator {
    function add(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
    
    function subtract(uint a, uint b) public pure returns (uint) {
        return a - b;
    }
}

contract DataStore {
    uint public data;
    
    constructor(uint _data) {
        data = _data;
    }
    
    function setData(uint _data) public {
        data = _data;
    }
    
    function getData() public view returns (uint) {
        return data;
    }
}

contract EmptyContract {
    // No state or functions
}

contract SimpleEvent {
    event Triggered(address sender, uint value);
    
    function trigger(uint _value) public {
        emit Triggered(msg.sender, _value);
    }
}

contract SimpleLogger {
    event Logged(uint value);
    
    function logValue(uint _value) public {
        emit Logged(_value);
    }
}
