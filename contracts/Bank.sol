// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract Payment
{
    event Bal(uint value,address from);
    
    struct payment{
        uint amount;
        uint timestamp;
    }
    
    struct Balance{
        uint totalAmount;
        uint no_payments;
        mapping(uint=>payment) payments;
    }
    
    mapping(address=>Balance) public paymentData;
    
    function sendToContract() payable public
    {
        paymentData[msg.sender].totalAmount+=msg.value;
        payment memory pay=payment(msg.value,block.timestamp);
        paymentData[msg.sender].payments[++paymentData[msg.sender].no_payments]=pay;
        //paymentData[msg.sender].no_payments++;
        emit Bal(paymentData[msg.sender].totalAmount,msg.sender);
    }
    
    function getContractBalance() public view returns(uint)
    {
        return address(this).balance;
    }
    
    function withdraw(uint _amount) public
    {
        require(paymentData[msg.sender].totalAmount>=_amount,"not enough funds");
        address payable add=payable(msg.sender);
        paymentData[msg.sender].totalAmount-=_amount;
        (bool sent, )=add.call{value:_amount}("");
        require(sent,"payment failed");
        emit Bal(paymentData[msg.sender].totalAmount,msg.sender);
        
    }
}