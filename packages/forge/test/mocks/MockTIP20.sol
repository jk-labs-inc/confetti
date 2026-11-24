// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "@openzeppelin/token/ERC20/presets/ERC20PresetFixedSupply.sol";

contract MockTIP20 is ERC20PresetFixedSupply {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address owner)
        ERC20PresetFixedSupply(name, symbol, initialSupply, owner)
    {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
