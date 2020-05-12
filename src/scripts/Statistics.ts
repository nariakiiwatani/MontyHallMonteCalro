import { Chart } from "chart.js";

export class Statistics {
	chart: Chart;
	counts: number[];
	constructor(parent: HTMLElement) {
		const canvas = document.createElement("canvas");

		this.chart = new Chart(
			canvas, 
			{
				type: "pie",
				data: {
					labels: ["変えてアタリ", "変えずハズレ", "変えずアタリ", "変えてハズレ"],
					datasets: [{
						backgroundColor: [
							"#FF0000",
							"#D03232",
							"#6464D0",
							"#0000FF"
						]
					}]
				},
				plugins: [{
					afterDatasetsDraw: (chart, easing) => {
						const ctx = chart.ctx;

						chart.data.datasets.forEach((dataset, i) => {
							let sum = 0;
							dataset.data.forEach((d) => {
								sum += d;
							});

							const meta = chart.getDatasetMeta(i);
							if (!meta.hidden) {
								meta.data.forEach((element, index) => {
									const data = dataset.data[index];
									if(data === 0) return;
									ctx.fillStyle = 'rgb(255, 255, 255)';

									const fontSize = 12;
									const fontStyle = 'normal';
									const fontFamily = 'Helvetica Neue';
									ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

									const labelString = chart.data.labels[index];
									const dataString = (dataset.data[index] / sum * 100).toFixed(2) + "%";

									ctx.textAlign = 'center';
									ctx.textBaseline = 'middle';

									const padding = 5;
									const position = element.tooltipPosition();
									ctx.fillText(labelString, position.x, position.y - (fontSize / 2) - padding);
									ctx.fillText(dataString, position.x, position.y + (fontSize / 2) - padding);
								});
							}
						});
					}
				}]
			}
		);
		parent.appendChild(canvas);

		parent.querySelector(".clear").addEventListener("click", () => {
			this.init();
		});
		this.init();
	}

	init(): void {
		this.counts = [0,0,0,0];
		this.update();
	}
	update(): void {
		this.chart.data.datasets[0].data = this.counts;
		this.chart.update();
	}
	count(changed: boolean, correct: boolean): void {
		const index = ((changed, correct) => {
			return (((correct?1:0)+(changed?2:0))+1)&3;
		})(changed, correct);
		this.counts[index]++;
		this.update();
	}
}