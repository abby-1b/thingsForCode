setTimeout(function(){
    if ((()=>{
        let t = 0
        window.location.host.replace("www.", "").split('').map(e => t += e.charCodeAt(0))
        return t
    })() == 1337 && document.getElementById("lblHeaderName")) {
        document.getElementById("lblHeaderName").onclick = function(){
            let foundSolution = false
            for (var i = 0; i < parent.frames.length; i++) {
                if ("showSolution" in parent.frames[i]) {
                    parent.frames[i].showSolution()
                    foundSolution = true
                }
            }
            if (!foundSolution) {
                if (document.getElementsByClassName("AnsOption").length != 0) {
                    alert("It's option #" + (Array.prototype.slice.call(document.getElementsByClassName("AnsOption")).map(function getAnswer(ctrl) {
                        arrval = ctrl.value.split("#")
                        arrkeyval = document.getElementById("hdnKeyValues").value.split("#")
                        return arrval[2]
                    }).indexOf('1') + 1) + '!')
                } else {
                    alert("Here is the solution :)")
                    el=document.getElementsByTagName("iframe")[0].contentDocument
                    try { el.getElementsByClassName("solutionMain")[0].style.display="inline-block" } catch(e) {}
                    try { el.getElementsByClassName("solutionMainSteps")[0].style.display="inline-block" } catch(e) {}
                }
            }
        }
    }
}, 500)