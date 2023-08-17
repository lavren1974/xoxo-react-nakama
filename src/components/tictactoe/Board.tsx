import { useState } from 'react';
import Square from './Square';
import Nakama from "../../utils/nakama";
import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

export default function Board() {

    const [squares, setSquares] = useState<(string | null)[]>(Array(9).fill(null));
    const [getGameColor, setGameColor] = useState<string>('');
    const [getClient, setClient] = useState<Client | undefined>(undefined);
    const [getSession, setSession] = useState<Session | undefined>(undefined);
    const [getSocket, setSocket] = useState<Socket | undefined>(undefined);
    const [getMatchID, setMatchID] = useState<string | undefined>(undefined);

    const authenticate = async () => {
        let useSSL = false; // Enable if server is run with an SSL certificate.
        const client = new Client("defaultkey", "127.0.0.1", "7350", useSSL);
        // this.client = new Client("defaultkey", "localhost", "7350");
        // this.client.ssl = false;
        setClient(client);

        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem("deviceId", deviceId);
        }
        //const session = await client.authenticateDevice(deviceId, create, "mycustomusername");
        const session: Session = await client.authenticateDevice(deviceId, true);
        setSession(session);
        console.log("authenticate()");
        localStorage.setItem("user_id", session.user_id!);

        const trace = false;
        const socket: Socket = client.createSocket(useSSL, trace);
        setSocket(socket);
        await socket.connect(session, true);
    }

    const findMatch = async () => {

        console.log("findMatch()");
        const rpcid = "find_match";
        const matches = await getClient!.rpc(getSession!, rpcid, {});
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

            //console.log(safeParsedJson.payload.matchIds[0]);
            setMatchID(safeParsedJson.payload.matchIds[0]);
            //console.log(getMatchID);

            //this.matchID = safeParsedJson.payload.matchIds[0];

            await getSocket!.joinMatch(safeParsedJson.payload.matchIds[0]);
            console.log("Match joined!");

            //console.log(this.socket!.onmatchdata);
        }




        let userId = localStorage.getItem("user_id");
        console.log("userId localStorage: ", userId);

        getSocket!.onmatchdata = (result) => {
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
                        setGameColor("O")

                    } else {
                        setGameColor("X")
                    }
                }
            }
        };


    }



    const makeMove = async (index: number) => {

        const data = { "position": index };
        await getSocket!.sendMatchState(getMatchID!, 4, JSON.stringify(data));
        console.log("Match data sent");
    }







    function handleClick(i: number) {
        const nextSquares = squares.slice();
        nextSquares[i] = getGameColor;
        setSquares(nextSquares);
        makeMove(i);

        console.log("getGameColor: ", getGameColor);

    }


    function BeginClick() {
        console.log("BeginClick");
        authenticate();
        //Nakama.findMatch();
    }

    function BeginClick2() {
        console.log("BeginClick2");
        //Nakama.authenticate();
        findMatch();
        //Nakama.nakamaListener();
        //setGameColor(Nakama.vvv);
    }
    function BeginClick3() {
        console.log("BeginClick3");
        //Nakama.authenticate();
        //Nakama.matchData();
    }

    return (
        <>
            <div className="board-row">
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
            </div>
            <div className="board-row">
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
            </div>
            <div className="board-row">
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
            </div>
            <button className="button-send" onClick={BeginClick}>Begin</button>
            <button className="button-send" onClick={BeginClick2}>Begin2</button>
            <button className="button-send" onClick={BeginClick3}>Begin3</button>
        </>
    );
}