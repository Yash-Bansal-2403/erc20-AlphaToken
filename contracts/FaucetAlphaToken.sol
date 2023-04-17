// SPDX-License-Identifier: MIT

//we will preload our faucet contract with the particular quantity of corresponding ERC20 tokens

//interface allows one contract to talk to other contract on blockchain
//at top of contrct we define interface & inside contract we create an object of interface
//and provide an address(of the contract to which we wantto communicate) as argunment
pragma solidity ^0.8.17;

//defining interface to interact with ERC20 contract and using its functionality
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract FaucetAlphaToken {
    address payable owner; //owner is payable so that he can withdraw tokens from contract anytime
    IERC20 public token; //to create instance of IERC20

    uint256 public withdrawalAmount = 50 * (10 ** 18); //to set withdrawl amount of the faucet
    uint256 public lockTime = 1 minutes; //to prevent user to make request of faucet until next 1 minute

    event Withdrawal(address indexed to, uint256 indexed amount);
    event Deposit(address indexed from, uint256 indexed amount);

    mapping(address => uint256) nextAccessTime;

    // mapping is created to store the time when user make the last request of faucet

    //so as to prevent user untill lockTime is completed

    constructor(address tokenAddress) payable {
        token = IERC20(tokenAddress); //tokenAddress is provided so as to interct with it using interface
        owner = payable(msg.sender);
    }

    //function to request tokens
    function requestTokens() public {
        require(
            msg.sender != address(0),
            "Request must not originate from a zero account"
        ); //to check if user address is valid or not
        require(
            token.balanceOf(address(this)) >= withdrawalAmount,
            "Insufficient balance in faucet for withdrawal request"
        ); //to check if faucet contract has sufficient fund or not
        require(
            block.timestamp >= nextAccessTime[msg.sender],
            "Insufficient time elapsed since last withdrawal - try again later."
        ); //to check if user is not asking for faucet before its locktime

        nextAccessTime[msg.sender] = block.timestamp + lockTime; //to store the time when user will be
        //able to again request for token

        token.transfer(msg.sender, withdrawalAmount); //this will interact with our contract and transfer
        //token into the caller account
    }

    //In Solidity, "receive" and "fallback" are two special functions that are used to handle incoming transactions to a contract when no other function matches the transaction data or if the function call fails.
    //The "receive" function is called when the contract receives ether without any function data attached to it. This function must be declared as a payable function and can be used to perform any necessary logic when ether is received. If the contract does not have a "receive" function, it will reject incoming ether transactions that do not match any function signatures.
    //The "fallback" function is called when the contract receives a transaction with invalid or non-existent function data attached to it. This function has no name and no arguments, and can be used to perform any necessary logic to handle the transaction. If the contract does not have a "fallback" function, the transaction will be rejected.
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    } //to check balance of faucet contract

    function setWithdrawalAmount(uint256 amount) public onlyOwner {
        withdrawalAmount = amount * (10 ** 18);
    } //to reset withdrawlAmount to new value

    function setLockTime(uint256 amount) public onlyOwner {
        lockTime = amount * 1 minutes;
    } //to reset lockTime to new value

    function withdraw() external onlyOwner {
        emit Withdrawal(msg.sender, token.balanceOf(address(this)));
        token.transfer(msg.sender, token.balanceOf(address(this)));
    } //to withdraw complete balance of te faucet contract

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }
}
