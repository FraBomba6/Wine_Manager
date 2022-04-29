const electron = require("electron")
const ipc = electron.ipcRenderer;
document.addEventListener("DOMContentLoaded", function(){
    ipc.send("mainWindowLoaded")
    ipc.on("resultSent", function(event, result){
        let resultEl = document.getElementById("result");
        console.log(result);
        for(let i = 0; i < result.length; i++){
            resultEl.innerHTML += result[i].nome.toString() + "<br/>";
        }
    });
});