(()=>{"use strict";const t=function(t,e){let r=0;return{length:t,type:e,numHits:r,shipIsSunk:!1,hitLocations:[],hit:function(){r+=1},isSunk:function(){return t===r}}},e=function(){let e=[],r=[],n=new Array(10);for(let t=0;t<n.length;t++)n[t]=new Array(10);for(let t=0;t<n.length;t++)for(let e=0;e<n.length;e++)n[t][e]={isShip:!1,isAttacked:!1};const o={carrier:5,battleship:4,cruiser:3,submarine:3,destroyer:2};function a(t,e,r,o){if("horizontal"===o){if(t+r>n.length)return!1;for(let o=t;o<t+r;o++)if(n[o][e].isShip)return!1}else if("vertical"===o){if(e+r>n.length)return!1;for(let o=e;o<e+r;o++)if(n[t][o].isShip)return!1}return!0}return{missedAttacks:e,ships:r,board:n,placeShips:function(){for(const[e,i]of Object.entries(o)){const o=t(i,e);r.push(o);let s=parseInt(prompt(`Enter x coordinate for ${e}`)),c=parseInt(prompt(`Enter y coordinate for ${e}`)),l=()=>{let t=prompt(`Enter orientation for ${e}`);if("horizontal"===t||"vertical"===t)return t;alert("Invalid orientation. Please enter horizontal or vertical.")},d=l();for(;!a(s,c,i,d);)alert("Invalid placement. Please enter new coordinates."),s=parseInt(prompt(`Enter x coordinate for ${e}`)),c=parseInt(prompt(`Enter y coordinate for ${e}`)),d=l();if("horizontal"===d)for(let t=s;t<s+i;t++)o.hitLocations.push({x:t,y:c}),n[t][c].isShip=!0,n[t][c].ship=o;else if("vertical"===d)for(let t=c;t<c+i;t++)o.hitLocations.push({x:s,y:t}),n[s][t].isShip=!0,n[s][t].ship=o}},receiveAttack:function(t,r){n[t][r].isAttacked=!0,n[t][r].isShip?n[t][r].ship.hit():e.push({x:t,y:r})},allSunk:function(){return r.every((t=>t.isSunk()))}}};document.getElementById("human-board"),document.getElementById("computer-board");const r=document.getElementById("human-board"),n={name:"Human",gameboard:e(),attack:function(t,e,r){t.receiveAttack(e,r)}},o={name:"Computer",gameboard:e(),attack:function(t){let e=Math.floor(10*Math.random()),r=Math.floor(10*Math.random());t.receiveAttack(e,r)}};n.gameboard.placeShips(),console.log(n),n.gameboard.board.forEach((t=>{t.forEach((t=>{const e=document.createElement("div");e.classList.add("square"),t.isShip&&e.classList.add("ship"),r.appendChild(e)}))}));let a=n;(()=>{document.getElementById("human-board");const t=document.getElementById("computer-board");return document.getElementById("message"),t.addEventListener("click",(function(t){!function(t,e){let r;r=a===n?o.gameboard:n.gameboard,a.attack(r,t,e)}(t.target.dataset.x,t.target.dataset.y)})),{renderBoards:function(){}}})().renderBoards()})();