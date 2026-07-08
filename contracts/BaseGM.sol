// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseGM {
    event GM(address indexed user, uint256 indexed day, uint256 streak, uint256 total);

    mapping(address => uint256) public lastDay;
    mapping(address => uint256) public streak;
    mapping(address => uint256) public total;

    function gm() external {
        uint256 currentDay = block.timestamp / 1 days;
        require(lastDay[msg.sender] < currentDay, "Already said GM today");

        if (lastDay[msg.sender] + 1 == currentDay) {
            streak[msg.sender] += 1;
        } else {
            streak[msg.sender] = 1;
        }

        lastDay[msg.sender] = currentDay;
        total[msg.sender] += 1;

        emit GM(msg.sender, currentDay, streak[msg.sender], total[msg.sender]);
    }
}
