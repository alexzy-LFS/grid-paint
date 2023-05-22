"use client";
import Image from "next/image";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { Racing_Sans_One, Ribeye } from "next/font/google";
import grid from "./grid";
import { BlockPicker, SketchPicker } from "react-color";

const GRID_SIZE = "16px";
const INIT_BG = "#fff";
const Grid = ({ rows, columns }) => {
  const [gridData, setGridData] = useState(
    new Array(rows).fill(0).map(() => new Array(columns).fill(INIT_BG))
  );

  //creating state to store our color and also set color using onChange event for block picker
  const [sketchPickerColor, setSketchPickerColor] = useState("#37d67a");
  const [ws, setWs] = useState(null);
  const [isDrag, setIsDrag] = useState(false);

  const gridHasChanged = () => {
    for (let i = 0; i < gridData.length; i++) {
      for (let j = 0; j < gridData[i].length; j++) {
        if (gridData[i][j] !== INIT_BG) {
          return true; // Found a non-"#FFF" element
        }
      }
    }
    return false; // All elements are "#FFF"
  }

  useEffect(() => {
    console.log(gridData.length);
    console.log(gridData[0].length);
  }, [gridData]);
  const getInitDataCall = { action: "whisper" };
  const paintCall = (x, y, hex) => ({
    action: "sendmessage",
    data: `${x}-${y}-${hex}`,
  });

  useEffect(() => {
    initSocket();
  }, []);
  useEffect(() => {
    bindWsCallback();
  }, [ws]);
  const bindWsCallback = () => {
    if (ws == null) return;

    ws.onopen = (e) => {
      console.log("onopen");
      console.log(e);
      // ws.send({"action":"error", "data":"data"})
      console.log("asking server for data...");
      ws.send(JSON.stringify(getInitDataCall));
    };

    // ws.addEventListener(

    // )
    // ws.onmessage =  (event) => {
    //   console.log("onmeesage")
    //   console.log(event)
    // };

    ws.addEventListener("message", (e) => {
      console.log("on message:")
      console.log(e.data)
      if (e.data.split("-").length == 3) {
        console.log("handle 1 paint")
        let [x, y, hex] = e.data.split("-");
        console.log(x)
        console.log(y)
        console.log(hex)
        paintOneGrid(x, y, hex);

      } else {
        console.log("hi");
          //send own copy of  data as whisper
          let { requester } = JSON.parse(e.data);
          if (requester) {
            console.log("send own copy of  data as whisper")
            sendWhisper(requester, JSON.stringify(gridData));
          }else{
            //handle init data
            console.log("handle init data")
            setGridData(JSON.parse(e.data))
          }
        console.log("end of hi");
      }
      /*
      if (e.data == "requestData") {
        if (gridHasChanged()){
          console.log("data requested, sending...")
          ws.send(JSON.stringify({"action":"sendmessage", "data": JSON.stringify(gridData)}));
        }
      }
      else 
      */
    });

    ws.addEventListener("close", (event) => {
      console.log("websocket closed");
      console.log(event);
      //refresh the page or something
      //TODO
    });
  };

  const initSocket = () => {
    console.log("initSocket");
    //#region websocket
    setWs(
      new WebSocket(
        "wss://s731e6ty23.execute-api.ap-southeast-1.amazonaws.com/Prod"
      )
    );
  }; //#region websocket
  const sendWhisper = (targetId, message) => {
    console.log("send whisper")
    let payload = JSON.stringify({
      "action": "whisper", "data": JSON.stringify({
        targetId: targetId,
        message: message
      })
    })
    console.log(payload)
    ws.send(payload);

  }
  const paintOneGrid = (x, y, hex) => {
    if (gridData[x][y] == hex) { return; }
    const newGridData = [...gridData];
    newGridData[x][y] = hex;
    setGridData(newGridData);
  };

  const handleCellClick = (rIdx, cIdx) => {
    paintOneGrid(rIdx, cIdx, sketchPickerColor);
    //send to others
    ws.send(JSON.stringify(paintCall(rIdx, cIdx, sketchPickerColor)));
  };

  return (
    <div
      className="grid"
      onMouseDown={() => {
        setIsDrag(true);
      }}
      onMouseUp={() => {
        setIsDrag(false);
      }}
    >
      <div className="blockpicker">
        <h6>Color Picker</h6>
        {/* Div to display the color  */}
        <div
          style={{
            backgroundColor: `${sketchPickerColor}`,
            width: 100,
            height: 50,
            border: "2px solid white",
          }}
        ></div>
        {/* Block Picker from react-color and handling color on onChange event */}
        <SketchPicker
          onChange={(color) => {
            setSketchPickerColor(color.hex);
          }}
          color={sketchPickerColor}
        />
      </div>
      {
        gridData.map((row, rIdx) => (
          // row
          <div
            key={rIdx}
            className="row"
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {
              row.map((hex, cIdx) => (
                <div
                  className="cell"
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    background: hex,
                    width: GRID_SIZE,
                    height: GRID_SIZE,
                    border: "1px dotted black",
                  }}
                  onMouseEnter={() => {
                    if (isDrag && ws && ws.readyState == 1)
                      handleCellClick(rIdx, cIdx);
                  }}
                ></div>
              ))
            }
          </div>
        ))
      }
    </div>
  );
};

export default function Home() {
  return (
    <main className={styles.main}>
      <Grid rows={30} columns={70}></Grid>
    </main>
  );
}
