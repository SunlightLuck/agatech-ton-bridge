import "./jetton";
message SetBridge {
    bridge: Address;
}
message Mint {
    to: Address;
    amount: Int;
}
message Burn {
    from: Address;
    amount: Int;
}

contract AgatechJetton with Jetton {
    total_supply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;
    bridge: Address;
    init(owner: Address, content: Cell, bridge: Address){
        self.total_supply = 0;
        self.owner = owner;
        self.mintable = true;
        self.content = content;
        self.bridge = bridge;
    }

    receive(msg: SetBridge){
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Not owner");
        self.bridge = msg.bridge;
    }

    receive(msg: Mint){
        let ctx: Context = context();
        require(ctx.sender == self.bridge, "Not bridge");
        self.mint(msg.to, msg.amount, self.bridge);
    }

    receive(msg: Burn){
        let ctx: Context = context();
        require(ctx.sender == self.bridge, "Not bridge");
        self.burn(msg.from, msg.amount, self.bridge);
    }

    get fun get_bridge_address(): Address {
        return self.bridge;
    }
}