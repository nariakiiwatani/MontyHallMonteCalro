import "normalize.css"
import "../styles/index.scss";

import { Simulator } from "./Simulator"
import { Statistics } from "./Statistics"

(()=> {
	const sta = new Statistics(document.querySelector("#statistics"));
	const sim = new Simulator(document.querySelector("#simulator"), (result)=>{sta.count(result.changed, result.correct);});
})();
