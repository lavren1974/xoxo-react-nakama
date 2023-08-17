import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

class Nakama {
    private client: Client | null = null;
    private session: Session | null = null;
    private socket: Socket | null = null;
    private matchID: string | undefined;
    public vvv: string | undefined;

    constructor() { }

    async authenticate() {
        let useSSL = false; // Enable if server is run with an SSL certificate.
        this.client = new Client("defaultkey", "127.0.0.1", "7350", useSSL);
        // this.client = new Client("defaultkey", "localhost", "7350");
        // this.client.ssl = false;

        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem("deviceId", deviceId);
        }
        //const session = await client.authenticateDevice(deviceId, create, "mycustomusername");
        this.session = await this.client.authenticateDevice(deviceId, true);
        console.log("authenticate()");
        localStorage.setItem("user_id", this.session.user_id!);

        const trace = false;
        this.socket = this.client.createSocket(useSSL, trace);
        await this.socket.connect(this.session, true);
    }

    async findMatch() {

        console.log("findMatch()");
        const rpcid = "find_match";
        const matches = await this.client!.rpc(this.session!, rpcid, {});
        console.log(matches);


        if (typeof matches === "object" && matches !== null) {
            const safeParsedJson = matches as {
                payload: {
                    matchIds: string[],
                    // height: string,
                    // weight: string,
                    // image: string,
                }

            };
            // console.log(safeParsedJson.payload.name);
            // console.log(safeParsedJson.payload.height);
            // console.log(safeParsedJson.payload.weight);
            console.log(safeParsedJson.payload.matchIds[0]);

            this.matchID = safeParsedJson.payload.matchIds[0];
            await this.socket!.joinMatch(this.matchID);
            console.log("Match joined!");
            //console.log(this.socket!.onmatchdata);
        }


    }


    async makeMove(index: number) {
        const data = { "position": index };
        await this.socket!.sendMatchState(this.matchID!, 4, JSON.stringify(data));
        console.log("Match data sent");
    }


    nakamaListener() {



        let userId = localStorage.getItem("user_id");
        console.log("userId localStorage: ", userId);

        this.socket!.onmatchdata = (result) => {
            const json_string = new TextDecoder().decode(result.data)
            const json: string = json_string ? JSON.parse(json_string) : ""
            //console.log(result.data);
            console.log(result.op_code);

            if (result.op_code === 1) {
                console.log("START");

                console.log(json);


                if (typeof json === "object" && json !== null) {
                    const safeParsedJson = json as {
                        //payload: {
                        board: number[],
                        deadline: number,
                        mark: number,
                        marks: { [key: string]: number },
                        // }

                    };




                    console.log(safeParsedJson.board);
                    console.log(safeParsedJson.marks);
                    //console.log(safeParsedJson.marks[1]);

                    if (safeParsedJson.marks[userId!] === 1) {
                        console.log("X");
                        this.vvv = "X"

                    } else {
                        console.log("O");
                        this.vvv = "O"

                    }
                }
            }
        };

    }


    setPlayerTurn(data: string) {

        console.log("setPlayerTurn: ", data);
        let userId = localStorage.getItem("user_id");
        console.log("userId localStorage: ", userId);

        // if (data.marks[userId] === 1) {
        //     console.log("X");
        //     // this.playerTurn = true;
        //     // this.playerPos = 1;
        //     // this.headerText.setText("Your turn!")
        // } else {
        //     console.log("O");
        //     //this.headerText.setText("Opponents turn!")
        // }


        // if (data.marks[userId] === 1) {
        //     this.playerTurn = true;
        //     this.playerPos = 1;
        //     this.headerText.setText("Your turn!")
        // } else {
        //     this.headerText.setText("Opponents turn!")
        // }
    }

    updateBoard(board: any) {

        console.log("updateBoard: ", board);
        // board.forEach((element, index) => {
        //     let newImage = this.INDEX_TO_POS[index]

        //     if (element === 1) {
        //         this.phaser.add.image(newImage.x, newImage.y, "O");
        //     } else if (element === 2) {
        //         this.phaser.add.image(newImage.x, newImage.y, "X");
        //     }
        // })
    }


    matchData() {

        console.log("matchData");
        let userId = localStorage.getItem("user_id");
        console.log("userId localStorage: ", userId);

        this.socket!.onmatchdata = (result) => {
            const json_string = new TextDecoder().decode(result.data)
            const json: string = json_string ? JSON.parse(json_string) : ""
            //console.log(result.data);
            console.log(result.op_code);

            if (result.op_code === 1) {
                console.log("START");
            }


            // switch (result.op_code) {
            //     case 1:
            //         //this.gameStarted = true
            //         this.setPlayerTurn(json)
            //         break;
            //     case 2:
            //         //console.log(result.data)
            //         this.updateBoard(json)
            //         //this.updatePlayerTurn()
            //         break;
            //     // case 3:
            //     //     this.endGame(json)
            //     //     break;
            // }
        };

    };




}

export default new Nakama();

