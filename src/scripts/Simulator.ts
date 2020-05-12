const autoSpeed: number = 100;
export class Simulator {
	info: HTMLElement;
	doors: HTMLElement[];
	autoTimer: number;
	resolve: Function;
	reject: Function;
	result: Function;
	condition: Function;
	randomArray:Function = (arr) => {
		return arr[Math.floor(Math.random()*arr.length)];
	};
	constructor(parent: HTMLElement, resultCallback: Function) {
		this.info = parent.querySelector(".info");
		this.doors = Array.prototype.slice.call(parent.querySelector(".doors").children);
		parent.querySelector(".reset").addEventListener("click", ()=> {
			this.reject();
		});
		const checkbox: HTMLInputElement = parent.querySelector(".auto");
		checkbox.addEventListener("change", (e)=> {
			window.clearInterval(this.autoTimer);
			if(checkbox.checked) {
				this.autoTimer = setInterval(()=> {
					this.randomArray(this.doors).click();
				}, autoSpeed);
			}
		});
		this.doors.forEach((target) => {
			target.addEventListener("click", ()=> {
				if(this.condition(target)) {
					this.resolve(target);
				}
			});
		});
		this.result = resultCallback;
		this.init();
	}
	init(): void {
		this.doors.forEach(door => door.className = "door");
		this.doors[Math.floor(Math.random()*this.doors.length)].className += " correct";
		this.start();
	}
	async start(): Promise<void> {
		try {
			const first = await this.first();
			first.className += " chosen first";
			const dealer = await this.dealer(true);
			dealer.className += " open";
			const second = await this.second();
			second.className += " open second";
			this.result({
				changed: first !== second,
				correct: second.className.split(" ").includes("correct")
			});
			await this.finish();
		}
		finally {
			this.init();
		}
	}
	awaitForClick(condition: (e:HTMLElement)=>boolean): Promise<HTMLElement> {
		this.condition = condition;
		return new Promise<HTMLElement>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	};
	async first(): Promise<HTMLElement> {
		this.info.textContent = "開くドアを選んでください";
		const door = await this.awaitForClick(()=>true);
		return door;
	}
	async dealer(auto: boolean): Promise<HTMLElement> {
		this.info.textContent = "不正解のドアをひとつ開けます";
		const condition = (door) => {
			const classes = door.className.split(" ");
			if(classes.includes("chosen") || classes.includes("correct")) {
				return false;
			}
			return true;
		};
		if(auto) {
			let door: HTMLElement;
			while(door = this.randomArray(this.doors), !condition(door)) {}
			return new Promise<HTMLElement>((resolve, reject) => {
				this.reject = reject;
				setTimeout(()=>{
					resolve(door);
				}, autoSpeed);}
			);
		}
		else {
			const door = await this.awaitForClick(condition);
			return door;
		}
	}
	async second(): Promise<HTMLElement> {
		this.info.textContent = "残ったドアのうちどちらのドアを開けますか？";
		const door = await this.awaitForClick((door) => {
			const classes = door.className.split(" ");
			if(classes.includes("open")) {
				return false;
			}
			return true;
		});
		return door;
	}
	async finish(): Promise<HTMLElement> {
		this.info.textContent = "どれかドアをクリックして最初に戻ります";
		this.doors.forEach((door)=> {
			door.className += " open";
		});
		const door = await this.awaitForClick(() => true);
		return door;
	}

}