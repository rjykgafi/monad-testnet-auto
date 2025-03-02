// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token {
    // Basic ERC20 fields
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Owner (for admin functions)
    address public owner;
    
    // Blacklist mapping
    mapping(address => bool) public blacklisted;
    
    // EIP-2612 permit variables
    mapping(address => uint256) public nonces;
    bytes32 public DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
    bytes32 public constant PERMIT_TYPEHASH = 0xd505accf7d4d7c8d5b7b1ec471de2e9872b6e1c38e6d82c1b3c6f4cf4a3f5a6b;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed account, uint256 value);
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);
    event Airdrop(address indexed from, address[] recipients, uint256 amount);
    event BatchTransfer(address indexed from, address[] recipients, uint256[] amounts);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Address is blacklisted");
        _;
    }
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        owner = msg.sender;
        balanceOf[msg.sender] = _totalSupply;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(_name)),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function _transfer(address from, address to, uint256 amount) internal notBlacklisted(from) notBlacklisted(to) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
    
    // Standard transfer
    function transfer(address to, uint256 amount) external notBlacklisted(msg.sender) notBlacklisted(to) returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    // Approve spender
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    // Standard transferFrom
    function transferFrom(address from, address to, uint256 amount) external notBlacklisted(from) notBlacklisted(to) returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }
    
    // Permit function (EIP-2612 style)
    function permit(address owner_, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, "Permit: expired deadline");
        bytes32 structHash = keccak256(abi.encode(
            PERMIT_TYPEHASH,
            owner_,
            spender,
            value,
            nonces[owner_],
            deadline
        ));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner_, "Invalid signature");
        allowance[owner_][spender] = value;
        nonces[owner_]++;
        emit Approval(owner_, spender, value);
    }
    
    // Burn tokens from msg.sender
    function burn(uint256 amount) external notBlacklisted(msg.sender) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance to burn");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    // Burn tokens from an account using allowance
    function burnFrom(address account, uint256 amount) external notBlacklisted(account) {
        require(allowance[account][msg.sender] >= amount, "Allowance exceeded for burn");
        require(balanceOf[account] >= amount, "Insufficient balance to burn");
        allowance[account][msg.sender] -= amount;
        balanceOf[account] -= amount;
        totalSupply -= amount;
        emit Burn(account, amount);
        emit Transfer(account, address(0), amount);
    }
    
    // Blacklist an address (only owner)
    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    // Unblacklist an address (only owner)
    function unblacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }
    
    // Airdrop: send the same amount to multiple addresses (only owner)
    function airdrop(address[] calldata recipients, uint256 amount) external onlyOwner {
        uint256 totalRequired = amount * recipients.length;
        require(balanceOf[msg.sender] >= totalRequired, "Insufficient balance for airdrop");
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amount);
        }
        emit Airdrop(msg.sender, recipients, amount);
    }
    
    // sendInBatch: send tokens to multiple addresses with specific amounts
    function sendInBatch(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(balanceOf[msg.sender] >= totalAmount, "Insufficient balance for batch transfer");
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        emit BatchTransfer(msg.sender, recipients, amounts);
    }
}
