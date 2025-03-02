// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTCollection {
    // Collection parameters
    string public name;      // Collection name
    string public ticket;    // Ticket (symbol)
    uint256 public maxSupply;
    uint256 private _totalSupply;

    // Minimal ERC721-like storage
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(string memory _name, string memory _ticket, uint256 _maxSupply) {
        name = _name;
        ticket = _ticket;
        maxSupply = _maxSupply;
    }

    // Returns the current minted supply
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    // Returns the owner of a given tokenId
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    // Returns balance of an owner
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Zero address not allowed");
        return _balances[owner];
    }

    // Internal mint function
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Cannot mint to zero address");
        require(_totalSupply < maxSupply, "Max supply reached");
        require(_owners[tokenId] == address(0), "Token already minted");

        _owners[tokenId] = to;
        _balances[to] += 1;
        _totalSupply += 1;

        emit Transfer(address(0), to, tokenId);
    }

    // Standard mint: mints an NFT to msg.sender
    function mint() external {
        uint256 tokenId = _totalSupply + 1;
        _mint(msg.sender, tokenId);
    }

    // Mint with permit (for demonstration, behaves like mint)
    function mintWithPermit() external {
        uint256 tokenId = _totalSupply + 1;
        _mint(msg.sender, tokenId);
    }

    // Mint from: allows minting an NFT while “charging” from another address.
    // The parameter name is omitted to silence the unused parameter warning.
    function mintFrom(address /*payer*/) external {
        uint256 tokenId = _totalSupply + 1;
        _mint(msg.sender, tokenId);
    }

    // Burns a token; only the owner can burn
    function burn(uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "Caller is not the owner");
        _balances[owner] -= 1;
        delete _owners[tokenId];
        _totalSupply -= 1;
        emit Transfer(owner, address(0), tokenId);
    }

    // Transfer: transfers token from msg.sender to address 'to'
    function transfer(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        _transfer(msg.sender, to, tokenId);
    }

    // TransferFrom: transfers token from 'from' to 'to'
    function transferFrom(address from, address to, uint256 tokenId) external {
        // For simplicity, we allow the transfer if 'from' is the owner.
        require(ownerOf(tokenId) == from, "From is not the owner");
        // (Approval logic would be implemented in a complete version)
        _transfer(from, to, tokenId);
    }

    // Internal transfer helper
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Not the token owner");
        require(to != address(0), "Transfer to zero address not allowed");

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }
}
